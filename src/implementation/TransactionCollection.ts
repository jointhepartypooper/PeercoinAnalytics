import { JsonRPCClient } from "../implementation/JsonRPCClient";
import type {
  IRawTransactionResponse,
  ITransactionOutput,
} from "../implementation/JsonRPCClient";

const oneyear = 365 * 24 * 3600; //1 year in seconds
const oneday = 24 * 3600; //1 day in seconds

export interface ResultData {
  date: number;
  amount: number;
  tag: string;
  amtTotal: number;
}

export interface ResultStats {
  avg: number;
  reward: number;
  interest: number;
  rewardpercent: number;
}

export interface ResultPosStats {
  posdate: Array<number>;
  posreward: number[];
  posdatediff: number[];
}

export interface IPlotdata {
  xAxis: Date[];
  yAxis: number[];
}

export interface IStatsData {
  avg: number;
  stake: number;
  interest: number;
  continuousMinter: boolean;
}

export class TransactionCollection {
  client: JsonRPCClient;

  public Transactions: Array<IRawTransactionResponse> = [];

  constructor(client: JsonRPCClient) {
    this.client = client;
  }

  getTransaction(txid: string): IRawTransactionResponse | null {
    const transaction = this.Transactions.find((t) => t.txid === txid);
    if (!!transaction) return transaction;
    return null;
  }

  async fetchTransactions(
    txids: string[],
    progressCallback: (p: number) => void
  ): Promise<IRawTransactionResponse[]> {
    let p = 0.0;
    for (let index = 0; index < txids.length; index++) {
      const transactionid = txids[index];
      const txraw = await this.getRawTransaction(transactionid);

      if (!txraw) {
        console.log("unable to get raw transaction " + transactionid);
      } else {
        this.Transactions.push(txraw);
      }
      let newprogress = 100.0 * (index / txids.length);
      if (newprogress - p >= 1.5) {
        p = newprogress;
        progressCallback(p);
      }
    }
    progressCallback(100);
    return this.Transactions;
  }

  private isEven(n: number): boolean {
    return n % 2 == 0;
  }

  //https://github.com/Nagalim/PeercoinAnalytics_js/blob/main/script_online.js#L180
  //Set the bar for Continuous Minting as earning 0.75% average interest before v0.9 and 3.75% after.
  static expavgint(minDate: number, maxDate: number): number {
    //in seconds!!!
    const cnfbar = 0.75;
    const switchdate = new Date("2020-06-05T01:00:00Z").getTime() / 1000;
    const binter = 1;
    const ainter = 5;
    let astart = 0;
    let tintage = 0;

    if (minDate < switchdate) {
      tintage = tintage + binter * (switchdate - minDate);
      astart = switchdate;
    } else {
      astart = minDate;
    }
    if (switchdate < maxDate) {
      tintage = tintage + ainter * (maxDate - astart);
    } else {
      tintage = tintage + binter * (maxDate - astart);
    }
    const tinter = (cnfbar * tintage) / (maxDate - minDate);
    return tinter;
  }

  getCoinsStaked(
    targetaddr: string,
    rawTx: IRawTransactionResponse,
    isPOW: boolean,
    specifiedVout: boolean
  ): number {
    let coinstaked = 0.0;
    for (let index = 0; index < rawTx.vout.length; index++) {
      const voutElement = rawTx.vout[index];
      if (index > 0) {
        if (isPOW) {
          if (
            !!voutElement.scriptPubKey &&
            !!voutElement.scriptPubKey.address
          ) {
            // when coins are mined with pow in a pool, other Addresses may be included
            // e.g.: PPGascbrTJGDSerDmrdSpXtmWSjHfkyUBS being the miner and PRQG79k1aGD4dqpdUFZ4nwQzEJTn6CsrmW as one of the participant
            if (voutElement.scriptPubKey.address === targetaddr) {
              coinstaked = coinstaked + voutElement.value;
            }
          } else {
            //   "type": "pubkey"
            if (!specifiedVout) {
              //no specificVout for this address found, must be the miner then:eg: PPGascbrTJGDSerDmrdSpXtmWSjHfkyUBS
              coinstaked = coinstaked + voutElement.value;
            }
          }
        } else {
          // a output can be splitted in 2 (or more)
          // just take values except the first:
          coinstaked = coinstaked + voutElement.value;
        }
      }
    }

    return coinstaked;
  }

  async getVoutFromTx(
    txid: string,
    index: number
  ): Promise<ITransactionOutput | null> {
    const prevTx = await this.getRawTransaction(txid);
    if (!!prevTx && !!prevTx.vout && prevTx.vout.length > index) {
      return prevTx.vout[index];
    }
    return null;
  }

  //https://github.com/Nagalim/PeercoinAnalytics_js/blob/main/script_online.js#L85
  public async procdata(
    targetaddr: string,
    transactions: IRawTransactionResponse[],
    progressCallback: (p: number) => void
  ): Promise<Array<ResultData>> {
    if (!transactions) return [];
    let alltx = [...transactions];
    alltx.sort((a, b) => {
      return a.blocktime - b.blocktime;
    });

    const txnid = [] as string[];
    const indxid = [] as number[];
    for (let indexTx = 0; indexTx < alltx.length; indexTx++) {
      const idtxn = alltx[indexTx].txid;
      if (!txnid.includes(idtxn)) {
        txnid.push(idtxn);
        indxid.push(indexTx);
      }
    }

    const resdata = [] as Array<ResultData>; //date is unixtime in seconds!

    let amtTot = 0; //cumulative total?
    let p = 0.0;
    for (let index = 0; index < indxid.length; index++) {
      let indx = indxid[index];
      let rawTx = alltx[indx];

      let txnamnt = 0;
      let isPOW = false;
      let specifiedVout =
        rawTx.vout.length > 0 &&
        !!rawTx.vout.find(
          (vo) =>
            !!vo.scriptPubKey &&
            !!vo.scriptPubKey.address &&
            vo.scriptPubKey.address === targetaddr
        );

      if (this.isCoinCreation(rawTx)) {
        let coinsIn = 0;
        if (!!rawTx.vin[0].txid) {
          //pos coinstake
          const prevVout = await this.getVoutFromTx(
            rawTx.vin[0].txid,
            rawTx.vin[0].vout
          );

          coinsIn = !!prevVout ? prevVout.value : 0;
        } else {
          //pow coins mined
          coinsIn = 0; // pow magic!
          isPOW = true;
        }
        const coinstaked = this.getCoinsStaked(
          targetaddr,
          rawTx,
          isPOW,
          specifiedVout
        );
        txnamnt = txnamnt + coinstaked - coinsIn;

        amtTot = amtTot + txnamnt;
        resdata.push({
          date: rawTx.blocktime,
          amount: txnamnt,
          tag: isPOW ? "Mined with pow" : "Mint by stake",
          amtTotal: amtTot,
        });
      } else {
        txnamnt = await this.getDeltaBalance(targetaddr, rawTx);

        amtTot = amtTot + txnamnt;
        resdata.push({
          date: rawTx.blocktime,
          amount: txnamnt,
          tag: "Send/Receive",
          amtTotal: amtTot,
        });
        let newprogress = 100.0 * (index / indxid.length);
        if (newprogress - p >= 1.5) {
          p = newprogress;
          progressCallback(p);
        }
      }
    } //for each tx...
    progressCallback(100);
    return resdata;
  }

  async getDeltaBalance(
    targetaddr: string,
    rawTx: IRawTransactionResponse
  ): Promise<number> {
    let txnamnt = 0.0;

    // add to balance if address is mentioned in vouts:
    for (let n = 0; n < rawTx.vout.length; n++) {
      if (!!rawTx.vout[n].scriptPubKey.address) {
        if (rawTx.vout[n].scriptPubKey.address === targetaddr) {
          //gains the value in outputs
          //console.log("gains: " + Number(rawTx.vout[n].value));
          txnamnt = txnamnt + Number(rawTx.vout[n].value);
        }
      }
    }
    // substract from balance if address is mentioned in vin:
    for (let vinIndex = 0; vinIndex < rawTx.vin.length; vinIndex++) {
      const prevoutput = rawTx.vin[vinIndex];
      const prevVout = await this.getVoutFromTx(
        prevoutput.txid,
        prevoutput.vout
      );
      const address =
        !!prevVout && !!prevVout.scriptPubKey.address
          ? prevVout.scriptPubKey.address
          : "";

      if (!!address && !!prevVout && address === targetaddr) {
        // minus the value from input if address equals targetaddr
        txnamnt = txnamnt - prevVout.value;
      }
    }

    return txnamnt;
  }

  public static getStats(
    mind: number, //timstamp in seconds!
    maxd: number,
    resdata: ResultData[]
  ): IStatsData {
    const avgint = this.calcintrst(mind, maxd, resdata);

    return {
      avg: avgint.avg, //Average Peercoin Balance: #ppc
      stake: avgint.reward, //Peercoin Minted: #ppc
      interest: avgint.interest, //Average Annualized Interest: % Earned
      continuousMinter: avgint.interest > this.expavgint(mind, maxd), //Minter Behavior
    } as IStatsData;
  }

  //Use the date window to spit out averages.
  static datedata(
    mind: number, //timstamp in seconds!
    maxd: number,
    resdata: ResultData[]
  ): Array<IPlotdata> {
    let xint = [] as Date[],
      yint2 = [] as number[],
      yint3 = [] as number[];

    for (let day = mind; day < maxd; day = day + oneday) {
      let annualized = this.calcintrst(day - oneyear, day, resdata);

      xint.push(new Date(day * 1000)); // construct Date with miliseconds
      yint2.push(annualized.interest);
      let cumint = this.calcintrst(mind, day, resdata);
      yint3.push(cumint.rewardpercent);
    }
    //plots 4 and 5 (mint events)

    const graphreward = this.posreward(mind, maxd, resdata);
    const xintpos = graphreward.posdate.map((d) => new Date(d * 1000)); // construct Date with miliseconds
    const yint4 = graphreward.posreward;
    const yint5 = graphreward.posdatediff;
    // plotdata(xint,yint2,'areatwo','lines+markers','Annualized Interest (%)');
    // plotdata(xint,yint3,'areathree','lines+markers','Percentage of Balance Minted (%)');
    // plotdata(xintpos,yint4,'areafour','markers','Mint Reward (# Coins)');
    // plotdata(xintpos,yint5,'areafive','markers','Time Between Mint Events (Days)');
    // document.getElementById('datebtn').style.background='#008000';
    // alert("Date Window Processed and Graphed");
    return [
      { xAxis: xint, yAxis: yint2 },
      { xAxis: xint, yAxis: yint3 },
      { xAxis: xintpos, yAxis: yint4 },
      { xAxis: xintpos, yAxis: yint5 },
    ];
  }

  //https://github.com/Nagalim/PeercoinAnalytics_js/blob/main/script_online.js#L158
  static posreward(
    mindate: number,
    maxdate: number,
    resdata: ResultData[]
  ): ResultPosStats {
    const posdate = [] as Array<number>;
    const posreward = [] as number[];
    const posdatediff = [] as number[];
    let k = -1;

    for (let index = 0; index < resdata.length; index++) {
      const data = resdata[index];
      if (
        data.date > mindate &&
        data.date < maxdate &&
        data.tag !== "Send/Receive"
      ) {
        k++;
        posdate.push(data.date);
        posreward.push(data.amount);
        if (k > 0) {
          const days = (posdate[k] - posdate[k - 1]) / oneday;
          posdatediff.push(days);
        } else {
          posdatediff[0] = 0;
        }
      }
    }

    return { posdate, posreward, posdatediff } as ResultPosStats;
  }

  //Calculate average balance, stake minted, annualized interest over date window, and total reward as percentage of balance.
  static calcintrst(
    mindate: number,
    maxdate: number,
    resdata: ResultData[]
  ): ResultStats {
    let sum = 0,
      reward = 0,
      len = resdata.length,
      onswitch = 0;

    for (let index = 0; index < resdata.length; index++) {
      const data = resdata[index];
      if (data.date > mindate && data.date < maxdate) {
        if (onswitch == 0 && index > 0) {
          sum = sum + resdata[index - 1].amtTotal * (data.date - mindate);
        } else {
          if (index + 1 === len || resdata[index + 1].amtTotal > maxdate) {
            sum = sum + data.amtTotal * (maxdate - data.amtTotal);
          } else {
            sum = sum + data.amtTotal * (resdata[index + 1].date - data.date);
          }
        }

        if (data.tag !== "Send/Receive") {
          reward = reward + data.amount;
        }
        onswitch = 1;
      }
    }

    const avg = sum / (maxdate - mindate);
    const interest = (100.0 * reward * oneyear) / sum;
    const rewardpercent = (100.0 * reward * (maxdate - mindate)) / (sum * 1.0);
    return { avg, reward, interest, rewardpercent } as ResultStats;
  }

  private isCoinCreation(tx: IRawTransactionResponse): boolean {
    // a coinstake has 1 item in vin and 2 or 3 in vout.
    //In case of 3 vouts the second is for the pooloperator who gets a cut. see https://blockbook.peercoin.net/tx/88b0c6c017d4d023144d35717870e11d0fd302ec25749bf2ca11edc488589b9c
    // or when it is a pow, all the participants gets a cut
    // type nulldata when it is a pow
    // type is nonstandard when it is a pos

    return (
      tx.vin.length === 1 &&
      tx.vout.length > 1 &&
      tx.vout[0].value <
        0.000001 /* && (tx.vout[0].type === 'nonstandard' || tx.vout[0].type === 'nulldata') */
    );
  }

  private async getRawTransaction(
    txId: string
  ): Promise<IRawTransactionResponse | null> {
    try {
      if (!txId) return null;
      return await this.client.getRawTransactionVerbose(txId);
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  // private async getDecodedTransaction(
  //   rawtransaction: string
  // ): Promise<IDecodeRawTransactionResponse | null> {
  //   try {
  //     if (!rawtransaction) return null;
  //     return await this.client.decodeRawTransaction(rawtransaction);
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   return null;
  // }
}
