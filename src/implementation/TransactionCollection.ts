import { JsonRPCClient } from "../implementation/JsonRPCClient";
import type { IDecodeRawTransactionResponse } from "../implementation/JsonRPCClient";
const Coin = 1000000; //	1 PPC = 1.000 mPPC
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
  xAxis: number[] | Date[];
  yAxis: number[];
}

export class TransactionCollection {
  client: JsonRPCClient;
  BlockHeaderSize = 80;

  public Transactions: Array<IDecodeRawTransactionResponse> = [];

  constructor(client: JsonRPCClient) {
    this.client = client;
  }

  getTransaction(txid: string): IDecodeRawTransactionResponse | null {
    const transaction = this.Transactions.find((t) => t.txid === txid);
    if (!!transaction) return transaction;
    return null;
  }

  async fetchTransactions(
    txids: string[]
  ): Promise<IDecodeRawTransactionResponse[]> {
    for (let index = 0; index < txids.length; index++) {
      const transactionid = txids[index];
      const hex = await this.getRawTransaction(transactionid);
      if (!hex) {
        console.log("unable to get raw transaction " + transactionid);
      } else {
        if (!this.isEven(hex.length)) throw hex + " is not even";

        const txraw = await this.getDecodedTransaction(hex);
        if (!txraw) throw "unable to get getDecodedTransaction " + hex;
        //let time = !!txraw.time ? txraw.time : block.time; // use blocktime if txtime is nt available

        this.Transactions.push(txraw);
      }
    }
    return this.Transactions;
  }

  private isEven(n: number): boolean {
    return n % 2 == 0;
  }

  //https://github.com/Nagalim/PeercoinAnalytics_js/blob/main/script_online.js#L180
  //Set the bar for Continuous Minting as earning 0.75% average interest before v0.9 and 3.75% after.
  public expavgint(minDate: number, maxDate: number): number {
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
    transactions: IDecodeRawTransactionResponse[]
  ): Promise<Array<ResultData>> {
    if (!transactions) return [];
    let txnjson = [...transactions];
    txnjson.sort((a, b) => {
      return a.time - b.time;
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
    const targetaddr = txnjson[0].hash;
    let amtTot = 0;

    for (let i = 0; i < indxid.length; i++) {
      let indx = indxid[i];
      let jsonindx = txnjson[indx];

      let txnamnt = 0;

      if (this.isCoinstake(jsonindx)) {
        const prevTxhash = await this.getRawTransaction(jsonindx.vin[0].txid);
        const prevTx = await this.getDecodedTransaction(prevTxhash!);
        const coinsIn = prevTx!.vout[jsonindx.vin[0].vout].value;
        const coinstaked = jsonindx.vout[jsonindx.vout.length - 1].value;
        txnamnt = txnamnt + coinstaked - coinsIn;
        amtTot = amtTot + txnamnt;
        resdata.push({
          date: jsonindx.time,
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
          const prevTxhash = await this.getRawTransaction(prevoutput.txid);
          const prevTx = await this.getDecodedTransaction(prevTxhash!);
          const prevvoutindex = prevoutput.vout;
          if (
            !!prevTx!.vout[prevvoutindex].scriptPubKey.address &&
            prevTx!.vout[prevvoutindex].scriptPubKey.address === targetaddr
          ) {
            // minus the value from inputs
            txnamnt = txnamnt - prevTx!.vout[prevvoutindex].value;
          }
        }
        amtTot = amtTot + txnamnt;
        resdata.push({
          date: jsonindx.time,
          amount: txnamnt,
          tag: "Send/Receive",
          amtTotal: amtTot,
        });
      }
    } //for each tx...

    return resdata;
  }

  //Use the date window to spit out averages.
  public datedata(
    mind: number, //timstamp in seconds!
    maxd: number,
    resdata: ResultData[]
  ): Array<IPlotdata> {
    //var mind = Date.parse(document.getElementById('windowstart').value);
    //var maxd = Date.parse(document.getElementById('windowend').value);
    let avgint = this.calcintrst(mind, maxd, resdata);
    let xint = [] as Date[],
      yint2 = [] as number[],
      yint3 = [] as number[];
    // document.getElementById('avg').innerHTML=avgint[0];
    // document.getElementById('stake').innerHTML=avgint[1];
    // document.getElementById('interest').innerHTML=avgint[2];

    //todo: use public function 
    if (avgint.interest > this.expavgint(mind, maxd)) {
      console.log("You were a CONTINUOUS minter during this period");
    } else {
      console.log("You were a PERIODIC minter during this period");
    }
    for (let i = mind; i < maxd; i = i + oneday) {
      let annualized = this.calcintrst(i - oneyear, i, resdata);
      let day = new Date(i * 1000);
      xint.push(day);
      yint2.push(annualized.interest);
      let cumint = this.calcintrst(mind, i, resdata);
      yint3.push(cumint.rewardpercent);
    }
    //plots 4 and 5 (mint events)
 
    const graphreward = this.posreward(mind, maxd, resdata);
    const xintpos = graphreward.posdate;
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
  public posreward(
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
  public calcintrst(
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

  private isCoinstake(tx: IDecodeRawTransactionResponse): boolean {
    // a coinstake has 1 item in vin and 2 or 3 in vout. In case of 3 vouts the second is for the pooloperator who gets a cut. see https://blockbook.peercoin.net/tx/88b0c6c017d4d023144d35717870e11d0fd302ec25749bf2ca11edc488589b9c

    return (
      tx.vin.length === 1 &&
      tx.vout.length > 1 &&
      tx.vout[0].value < 0.000001 /* && tx.vout[0].type === 'nonstandard' */
    );
  }

  private async getRawTransaction(txId: string): Promise<string | null> {
    try {
      if (!txId) return null;
      return await this.client.getRawTransaction(txId, 0);
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  private async getDecodedTransaction(
    rawtransaction: string
  ): Promise<IDecodeRawTransactionResponse | null> {
    try {
      if (!rawtransaction) return null;
      return await this.client.decodeRawTransaction(rawtransaction);
    } catch (error) {
      console.error(error);
    }
    return null;
  }
}
