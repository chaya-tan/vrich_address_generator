import React, { Component } from "react";
import axios from "axios";
import JsBarcode from "jsbarcode/bin/JsBarcode";

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
    this.textToBase64Barcode = this.textToBase64Barcode.bind(this);
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
      console.log("data", data);
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
        let productTableContent = {
          style: "tableExample",
          table: {
            headerRows: 1,
            body: [
              [
                { text: "สินค้า", style: "tableHeader" },
                { text: "#", style: "tableHeader" },
                { text: "สินค้า", style: "tableHeader" },
                { text: "#", style: "tableHeader" },
              ],
            ],
          },
          layout: "lightHorizontalLines",
          // pageBreak: "after",
        };
        order.products.forEach(
          (product) => (productContent += `${product.name} x 1\n`)
        );
        OrderItems.sort((orderItemA, orderItemB) => {
          return orderItemA.product.category.localeCompare(
            orderItemB.product.category
          );
        }).forEach((orderItem, orderItemIndex) => {
          productContent += `${orderItemIndex + 1}. ${
            orderItem.product.name
          } x ${orderItem.quantity}\n`;

          if (orderItemIndex % 2 === 0) {
            console.log("orderItem", orderItem);
            console.log(
              "OrderItems[orderItemIndex + 1]",
              OrderItems[orderItemIndex + 1]
            );
            if (orderItemIndex + 1 < OrderItems.length) {
              productTableContent.table.body.push([
                OrderItems[orderItemIndex].product.name,
                `${OrderItems[orderItemIndex].quantity}`,
                OrderItems[orderItemIndex + 1].product.name,
                `${OrderItems[orderItemIndex + 1].quantity}`,
              ]);
            } else {
              productTableContent.table.body.push([
                OrderItems[orderItemIndex].product.name,
                `${OrderItems[orderItemIndex].quantity}`,
                "",
                "",
              ]);
            }
          }
        });

        const newContent = this.state.pagesContent;
        newContent.push({ text: pageNumber, style: { alignment: "right" } });
        if (order.airWayBill[0])
          newContent.push({
            image: `${this.textToBase64Barcode(
              order.airWayBill[0].trackingNo
            )}`,
            height: 50,
            width: 120,
          });
        newContent.push({
          text: `${addressContent}\n\n`,
          style: { bold: true },
        });

        const productStyle = { bold: true, fontSize: 12 };
        if (orderIndex + 1 === data.length) {
          // newContent.push({ text: productContent, style: productStyle });

          newContent.push(productTableContent);
        } else {
          // newContent.push({
          //   text: productContent,
          //   pageBreak: "after",
          //   style: productStyle,
          // });
          productTableContent.pageBreak = "after";
          newContent.push(productTableContent);
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

  textToBase64Barcode(text) {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, text, { format: "CODE128" });
    return canvas.toDataURL("image/png");
  }

  onSubmitOrderStatus() {
    console.log("onSubmitOrderStatus");
    const orderIds = this.state.orders.map((order) => order.id);
    var data = JSON.stringify({ orderIds });

    try {
      axios({
        method: "post",
        url: "https://caseit-git-develop-chaya-tan.vercel.app/api/order/update/paidToPacked",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      }).then((res) => {
        window.location.reload();
      });
    } catch (error) {
      console.log("error submit pack status:", error);
    }
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
        <p>
          พิมพ์แล้วไป
          <a href="https://caseit-git-develop-chaya-tan.vercel.app/image/export">
            ปริ๊นรูป
          </a>
          ก่อน ค่อยมากดปุ่มข้างล่าง
        </p>

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
