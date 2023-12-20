import { JsonRPCClient } from "../implementation/JsonRPCClient";
import type { IRawTransactionResponse } from "../implementation/JsonRPCClient";

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

  //https://github.com/Nagalim/PeercoinAnalytics_js/blob/main/script_online.js#L85
  public async procdata(
    targetaddr: string,
    transactions: IRawTransactionResponse[],
    progressCallback: (p: number) => void
  ): Promise<Array<ResultData>> {
    if (!transactions) return [];
    let txnjson = [...transactions];
    txnjson.sort((a, b) => {
      return a.blocktime - b.blocktime;
    });

    const txnid = [] as string[];
    const indxid = [] as number[];
    for (let m = 0; m < txnjson.length; m++) {
      let idtxn = txnjson[m].txid;
      if (!txnid.includes(idtxn)) {
        txnid.push(idtxn);
        indxid.push(m);
      }
    }

    const resdata = [] as Array<ResultData>; //date is unixtime in seconds!

    let amtTot = 0; //cumulative total?
    let p = 0.0;
    for (let index = 0; index < indxid.length; index++) {
      let indx = indxid[index];
      let jsonindx = txnjson[indx];

      let txnamnt = 0;

      if (this.isCoinstake(jsonindx)) {
        let coinsIn = 0;
        if (!!jsonindx.vin[0].txid) {
          //pos coinstake
          const prevTx = await this.getRawTransaction(jsonindx.vin[0].txid);
          coinsIn = prevTx!.vout[jsonindx.vin[0].vout].value;
        } else {
          //pow coins mined
          coinsIn = 0; // pow magic!
          debugger;
        }

        // a output can be splitted in 2 (or more)
        //just take values except the first:
        let coinstaked = 0.0;
        for (let index = 0; index < jsonindx.vout.length; index++) {
          const voutElement = jsonindx.vout[index];
          if (index > 0) {
            coinstaked = coinstaked + voutElement.value;
          }
        }

        txnamnt = txnamnt + coinstaked - coinsIn;

        amtTot = amtTot + txnamnt;
        resdata.push({
          date: jsonindx.blocktime,
          amount: txnamnt,
          tag: "Mint by stake",
          amtTotal: amtTot,
        });
      } else {
        for (let n = 0; n < jsonindx.vout.length; n++) {
          if (
            !!jsonindx.vout[n].scriptPubKey.address &&
            jsonindx.vout[n].scriptPubKey.address === targetaddr
          ) {
            //gains the value in outputs
            txnamnt = txnamnt + Number(jsonindx.vout[n].value);
          }
        }

        for (let p = 0; p < jsonindx.vin.length; p++) {
          const prevoutput = jsonindx.vin[p];
          const prevTx = await this.getRawTransaction(prevoutput.txid);

          const prevvoutindex = prevoutput.vout;
          const prevVoutArr = !!prevTx ? prevTx.vout : [];
          const address =
            !!prevTx &&
            !!prevVoutArr &&
            prevVoutArr.length > prevvoutindex &&
            !!prevVoutArr[prevvoutindex].scriptPubKey.address
              ? prevVoutArr[prevvoutindex].scriptPubKey.address
              : "";
          if (!!address && address === targetaddr) {
            // minus the value from inputs
            txnamnt = txnamnt - prevVoutArr[prevvoutindex].value;
          }
        }

        amtTot = amtTot + txnamnt;
        resdata.push({
          date: jsonindx.blocktime,
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

  public static getStats(
    mind: number, //timstamp in seconds!
    maxd: number,
    resdata: ResultData[]
  ): IStatsData {
    const avgint = this.calcintrst(mind, maxd, resdata);

    // if (avgint.interest > this.expavgint(mind, maxd)) {
    //   console.log("You were a CONTINUOUS minter during this period");
    // } else {
    //   console.log("You were a PERIODIC minter during this period");
    // }
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
        data.tag === "Mint by stake"
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

        if (data.tag === "Mint by stake") {
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

  private isCoinstake(tx: IRawTransactionResponse): boolean {
    // a coinstake has 1 item in vin and 2 or 3 in vout. In case of 3 vouts the second is for the pooloperator who gets a cut. see https://blockbook.peercoin.net/tx/88b0c6c017d4d023144d35717870e11d0fd302ec25749bf2ca11edc488589b9c

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
