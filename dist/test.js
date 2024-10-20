"use strict";
// export {};
Object.defineProperty(exports, "__esModule", { value: true });
// abstract class name {
//   x: number = 10;
//   constructor() {}
// }
// interface Name {
//   x: number;
// }
// class Derive extends name {}
// const obj: name = new Derive();
// console.log(obj.x);
// A bike race is being organised with N bikers. The initial speed and the acceleration of the bikers are given in arrays H[] and A[] respectively. A biker whose speed is L or more is considered to be a fast biker. The total speed on the track for every hour is calculated by adding the speed of each fast biker in that hour. When the total speed on the track is M km/hour or more, the safety alarm turns on. The task is to find the minimum number of hours after which the safety alarm will turn on.
// const n = 3;
// const m = 400;
// const l = 120;
// const H = [20, 50, 20];
// const A = [20, 70, 90];
// let hourspend = 0;
// let totalspeed = 0;
// totalspeed >= return hourspend
// interface IClass {
//   valP: number;
//   parentMethod(val?: string): void;
// }
// abstract class AClass {}
// class Parent extends AClass {
//   valP: number;
//   constructor(valP: number) {
//     super();
//     this.valP = valP;
//   }
//   parentMethod(newVal: string) {
//     console.log("parent method", this.valP, newVal);
//   }
// }
// class Child extends Parent {
//   valC: number;
//   constructor(valP: number, valC: number) {
//     super(valP);
//     this.valC = valC;
//   }
//   parentMethod(str?: string): void {
//     if (str) {
//       super.parentMethod(str);
//       return;
//     }
//     console.log("child method");
//   }
// }
// const c = new Child(10, 12);
// c.parentMethod("dsds");
// c.parentMethod();
// import * as readline from "readline";
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });
let inp = "";
process.stdin.on("data", (chunk) => {
    inp += chunk;
    console.log(inp);
});
