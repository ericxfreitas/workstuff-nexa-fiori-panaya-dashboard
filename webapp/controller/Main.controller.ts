/* eslint-disable no-console */
import UIComponent from "sap/ui/core/UIComponent";
import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Card, { Card$ActionEvent } from "sap/ui/integration/widgets/Card";
import GridContainer from "sap/f/GridContainer";
import GridContainerItemLayoutData from "sap/f/GridContainerItemLayoutData";
import Device from "sap/ui/Device";
import DatePicker, { DatePicker$ChangeEvent } from "sap/m/DatePicker";
import Filter from "sap/ui/model/Filter";
import InfoLabel from "sap/tnt/InfoLabel";

/**
 * @namespace panaya.nexa.controller
 */
export default class Main extends Controller {
  /*eslint-disable @typescript-eslint/no-empty-function*/
  public onInit(): void {
    const infoLabelLastUpdate = this.byId("infoLastUpdate") as InfoLabel;
    infoLabelLastUpdate.bindElement(
      "/infos(lastUpdatedDay='',lastUpdatedTime='')"
    );
    // const date = new Date();
    // const datePicker = this.byId("dtDueDate") as DatePicker;
    // datePicker.setDateValue(date);
    // const currentDate = datePicker.getValue();
    const component = this.getOwnerComponent() as UIComponent;
    const appDataModel = component.getModel("appData") as JSONModel;
    const appData = appDataModel.getProperty("/");
    appData.currentDate = "Acumulado até hoje";
    appDataModel.setProperty("/", appData);
    this.getChartData();
  }

  public getChartData(): void {
    const component = this.getOwnerComponent() as UIComponent;
    const oModel = component.getModel() as ODataModel;
    const appDataModel = component.getModel("appData") as JSONModel;
    const appData = appDataModel.getProperty("/");
    let oFilter;
    let filters;

    if(appData.currentDate === "Acumulado até hoje"){
        oFilter = new Filter("dueDate", "EQ", "accumulated");
        filters = new Filter({
          filters: [oFilter]
        });
    } else {
        const datePicker = this.byId("dtDueDate") as DatePicker;
        const sapdate = this.formatDateToSAP(datePicker.getDateValue());
    
        oFilter = new Filter("dueDate", "EQ", sapdate);
        filters = new Filter({
          filters: [oFilter]
        });
    }

    oModel.read("/stepResumes", {
      filters: [filters],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      success: (odata: any) => {
        const generalChart = [
          { status: "Passed", value: 0 },
          { status: "Not Run", value: 0 },
          { status: "Not Applicable", value: 0 },
          { status: "In Progress", value: 0 },
          { status: "Failed", value: 0 }
        ];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const areaCharts: any[] = [];
        for (const data of odata.results) {
          const index = generalChart.findIndex(
            (obj) => obj.status === data.status
          );
          if (index === -1) {
            const generalChartData = { status: "", value: 0 };
            generalChartData.status = data.status;
            generalChartData.value = data.qty;
            generalChart.push(generalChartData);
          } else {
            const generalChartData = generalChart[index];
            generalChartData.value = generalChartData.value + data.qty;
          }

          const indexArea = areaCharts.findIndex(
            (obj) => obj.name === data.id1
          );

          if (indexArea === -1) {
            const areaChart = {
              name: data.id1,
              status: [
                {
                  status: data.status,
                  value: data.qty
                }
              ]
            };
            areaCharts.push(areaChart);
          } else {
            areaCharts[indexArea].status.push({
              status: data.status,
              value: data.qty
            });
          }
        }
        this.createChart(areaCharts);

        const chartData = component.getModel("chartData") as JSONModel;
        chartData.setProperty(
          "/general/sap.card/content/data/json/status",
          generalChart
        );
        chartData.refresh(true);
        const generalStepsCard = this.byId("generalStepsChart") as Card;
        generalStepsCard.refresh();
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createChart(areaCharts: any[]): void {
    const component = this.getOwnerComponent() as UIComponent;
    const chartData = component.getModel("chartData") as JSONModel;
    const manifest = chartData.getProperty("/general");
    const gridContainer = this.byId("gridContainer") as GridContainer;
    gridContainer.destroyItems();

    for (const areaChart of areaCharts) {
      this.addAllStatus(areaChart.status);

      const newManifest = JSON.parse(JSON.stringify(manifest));
      newManifest["sap.card"].content.data.json.status = areaChart.status;
      newManifest["sap.card"].content.title.text = areaChart.name;
      newManifest["sap.card"].content.title.visible = true;
      const newChart = new Card({ manifest: newManifest });
      const gridLayout = new GridContainerItemLayoutData({
        rows: 4,
        columns: 4
      });
      newChart.setLayoutData(gridLayout);

      gridContainer.addItem(newChart);
      // const newChart = new Card({ manifest: `{chartData>/${areaChart.name}}` });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public addAllStatus(statusList: Array<any>): void {
    const allStatus = [
      "Not Run",
      "Failed",
      "Passed",
      "In Progress",
      "Not Applicable"
    ];

    for (const status of allStatus) {
      const index = statusList.findIndex((obj) => obj.status === status);
      if (index === -1) {
        statusList.push({ status: status, value: 0 });
      }
    }
    statusList.sort((a, b) => {
      if (a.status > b.status) {
        return -1;
      }
      if (a.status < b.status) {
        return 1;
      }
      return 0; // Names are equal
    });
  }

  public onPressCard(oEvent: Card$ActionEvent) {
    const bReplace = !Device.system.phone;
    const component = this.getOwnerComponent() as UIComponent;
    const router = component.getRouter();
    router.navTo("RouteDetailView", undefined, bReplace);
    console.log(oEvent);
  }

  public onChangeDate(oEvent: DatePicker$ChangeEvent) {
    const datePicker = oEvent.getSource() as DatePicker;
    const date = datePicker.getDateValue();
    const currentDate = datePicker.getValue();
    this.getChartData();
    const sapdate = this.formatDateToSAP(date);
    const component = this.getOwnerComponent() as UIComponent;
    const appDataModel = component.getModel("appData") as JSONModel;
    const appData = appDataModel.getProperty("/");
    appData.dueDate = sapdate;
    appData.currentDate = currentDate;
    appDataModel.setProperty("/", appData);
  }

  public formatDateToSAP(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 for zero-based months
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}${month}${day}`;
  }

  public onToggleScreen() {
    const oModelAppView = this.getView()?.getModel("appView") as JSONModel;
    const appView = oModelAppView.getProperty("/");

    if (appView.layout === "TwoColumnsMidExpanded") {
      appView.layout = "OneColumn";
    } else {
      appView.layout = "TwoColumnsMidExpanded";
    }

    oModelAppView.setProperty("/", appView);
  }

  public onChangeAccumulated() {
    const component = this.getOwnerComponent() as UIComponent;
    const appDataModel = component.getModel("appData") as JSONModel;
    const appData = appDataModel.getProperty("/");

    if(appData.currentDate === "Acumulado até hoje") {
        const date = new Date();
        const datePicker = this.byId("dtDueDate") as DatePicker;
        datePicker.setDateValue(date);
        const currentDate = datePicker.getValue();
        appData.currentDate = currentDate;
        const sapdate = this.formatDateToSAP(date);
        appData.dueDate = sapdate;
    } else {
        appData.currentDate = "Acumulado até hoje";
        appData.dueDate = "accumula";
    }

    appDataModel.setProperty("/", appData);
    this.getChartData();
  }
}
