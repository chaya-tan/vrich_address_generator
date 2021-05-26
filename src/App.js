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

const base64JTLogo =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAUCAYAAAByKzjvAAAAAXNSR0IArs4c6QAAAKRlWElmTU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgExAAIAAAAfAAAAWodpAAQAAAABAAAAegAAAAAAAABIAAAAAQAAAEgAAAABQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAYKADAAQAAAABAAAAFAAAAADc2iJ7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAEEmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD54bXAuZGlkOjZBNTI0NzdBM0UyNTExRTk5QTA2RjUxOThGRTVFRjI0PC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjZBNTI0Nzc5M0UyNTExRTk5QTA2RjUxOThGRTVFRjI0PC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RGVyaXZlZEZyb20gcmRmOnBhcnNlVHlwZT0iUmVz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";
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

        const pageNumber = `ID: ${order.id} page: ${orderIndex + 1}\n`;
        const isBKK = address.province === "กรุงเทพมหานคร";
        const addressContent = `ผู้รับ: ${address.name} ${address.detail} ${
          isBKK ? "เขต" : "ต."
        }${address.district} ${isBKK ? "แขวง" : "อ."}${address.amphoe} จ.${
          address.province
        } ${address.zipcode} โทร ${address.phoneNo}`;
        let productContent = "";
        let productTableContent = {
          style: {
            bold: true,
            fontSize: 14,
          },
          table: {
            // headerRows: 1,
            body: [
              // [
              //   {
              //     text: "สินค้า",
              //     style: "tableHeader",
              //     border: [true, true, false, true],
              //   },
              //   { text: "#", style: "tableHeader" },
              //   {
              //     text: "สินค้า",
              //     style: "tableHeader",
              //     border: [true, true, false, true],
              //   },
              //   { text: "#", style: "tableHeader" },
              // ],
            ],
          },
          // layout: "lightHorizontalLines",
          layout: { defaultBorder: false },
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
                {
                  text: OrderItems[orderItemIndex].product.name,
                  border: [true, true, false, true],
                }, // OrderItems[orderItemIndex].product.name,
                {
                  text: `${OrderItems[orderItemIndex].quantity}`,
                  border: [false, true, true, true],
                },
                // `${OrderItems[orderItemIndex].quantity}`,
                {
                  text: OrderItems[orderItemIndex + 1].product.name,
                  border: [true, true, false, true],
                },
                // OrderItems[orderItemIndex + 1].product.name,
                {
                  text: `${OrderItems[orderItemIndex + 1].quantity}`,
                  border: [false, true, true, true],
                },
                // `${OrderItems[orderItemIndex + 1].quantity}`,
              ]);
            } else {
              productTableContent.table.body.push([
                {
                  text: OrderItems[orderItemIndex].product.name,
                  border: [true, true, false, true],
                }, // OrderItems[orderItemIndex].product.name,
                {
                  text: `${OrderItems[orderItemIndex].quantity}`,
                  border: [false, true, true, true],
                },
                "",
                "",
              ]);
            }
          }
        });

        const newContent = this.state.pagesContent;
        newContent.push({ text: pageNumber, style: { alignment: "right" } });
        if (order.airWayBill[0]) {
          const airWayBillTableContent = {
            table: {
              body: [
                [
                  {
                    table: {
                      body: [
                        [
                          {
                            text: order.airWayBill[0].sortingCode,
                            fontSize: 15,
                            font: "Roboto",
                            bold: true,
                            alignment: "center",
                          },
                        ],
                        [
                          {
                            image: `${this.textToBase64Barcode(
                              order.airWayBill[0].trackingNo
                            )}`,
                            height: 50,
                            width: 120,
                          },
                        ],
                      ],
                    },
                    layout: "noBorders",
                  },
                  {
                    table: {
                      body: [
                        [
                          {
                            image: base64JTLogo,
                            height: 10,
                            width: 50,
                          },
                        ],
                        [
                          {
                            text: "ผู้ส่ง\nCASEit 2 พิศณุโลก เขตดุสิต แขวงดุสิต กทม. 10900 0944969638",
                            fontSize: 11,
                            bold: true,
                          },
                        ],
                      ],
                    },
                    layout: "noBorders",
                  },
                ],
              ],
            },
          };
          const onlyBarcodeContent = {
            image: `${this.textToBase64Barcode(
              order.airWayBill[0].trackingNo
            )}`,
            height: 50,
            width: 120,
          };
          newContent.push(airWayBillTableContent);
        }

        newContent.push({
          text: `${addressContent}\n`,
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
      pageSize: { width: 283, height: 425 }, // 100 * 150 mm
      // pageSize: { width: 283, height: 566 },
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
