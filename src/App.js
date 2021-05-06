import React, { Component } from "react";
import axios from "axios";

import logo from "./logo.svg";
import "./App.css";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "./pdfmake/build/vfs_fonts";

import "./firebase";
import firebase from "./firebase";

const storageRef = firebase.storage().ref();

pdfMake.vfs = pdfFonts.pdfMake.vfs;

pdfMake.fonts = {
  THSarabunNew: {
    normal: "THSarabunNew.ttf",
    bold: "THSarabunNew-Bold.ttf",
    italics: "THSarabunNew-Italic.ttf",
    bolditalics: "THSarabunNew-BoldItalic.ttf",
  },
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
};

class App extends Component {
  constructor(props) {
    super(props);
    this.printPDF = this.printPDF.bind(this);
    this.onSubmitOrderStatus = this.onSubmitOrderStatus.bind(this);
  }

  state = {
    images: [],
    orders: [],
    pagesContent: [],
  };

  componentDidMount() {
    console.log("storageRef", storageRef);
    axios({
      method: "get",
      url: "https://caseit-git-develop-chaya-tan.vercel.app/api/order/getPaid",
      headers: {},
      data: {},
    }).then((res) => {
      const { data } = res.data;
      this.setState({ ...this.state, orders: data });
      data.forEach((order, orderIndex) => {
        const { address, OrderItems } = order;

        const pageNumber = `${orderIndex + 1}\n`;
        const isBKK = address.province === "กรุงเทพมหานคร";
        const addressContent = `ID: ${order.id}\n${address.name}\n${
          address.detail
        } ${isBKK ? "เขต" : "ต."}${address.district} ${isBKK ? "แขวง" : "อ."}${
          address.amphoe
        } จ.${address.province} ${address.zipcode} โทร ${address.phoneNo}`;
        let productContent = "";
        order.products.forEach(
          (product) => (productContent += `${product.name} x 1\n`)
        );
        OrderItems.sort((orderItemA, orderItemB) => {
          return orderItemA.product.category.localeCompare(
            orderItemB.product.category
          );
        }).forEach(
          (orderItem, orderItemIndex) =>
            (productContent += `${orderItemIndex + 1}. ${
              orderItem.product.name
            } x ${orderItem.quantity}\n`)
        );
        const newContent = this.state.pagesContent;
        newContent.push({ text: pageNumber, style: { alignment: "right" } });
        newContent.push({ text: `${addressContent}\n\n` });
        if (orderIndex + 1 === data.length) {
          newContent.push({ text: productContent });
        } else {
          newContent.push({ text: productContent, pageBreak: "after" });
        }
        this.setState({ ...this.state, pagesContent: newContent });
      });
    });
  }

  printPDF() {
    var docDefinition = {
      pageSize: { width: 283, height: 425 },
      pageMargins: [25, 25],
      content: this.state.pagesContent,
      defaultStyle: {
        font: "THSarabunNew",
      },
    };
    pdfMake.createPdf(docDefinition).open();
  }

  onSubmitOrderStatus() {
    console.log("onSubmitOrderStatus");
  }

  /**/

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">รักพี่จมปู้ 💜💜💜💜</h1>
        </header>

        <p className="App-intro">กดได้เลยคร้าบ แล้วถ่ายรูปลงกลุ่มว่ามีกี่ใบ</p>
        <p>มีทั้งหมด {this.state.orders.length} ใบ</p>

        <div>
          <input
            type="button"
            value="กดพิมพ์ที่อยู่"
            onClick={this.printPDF}
            style={{ marginBottom: 30 }}
          />
        </div>
        <input
          type="button"
          value="ที่อยู่พิมพ์เรียบร้อยกดตรงนี้เยยคร้าบ"
          onClick={this.onSubmitOrderStatus}
        />
        <p>
          เลขออเดอร์ :
          {this.state.orders.map((order) => (
            <span key={order.id}>{` ${order.id}, `}</span>
          ))}
        </p>
      </div>
    );
  }
}

export default App;
