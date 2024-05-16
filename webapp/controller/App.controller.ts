import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
/**
 * @namespace panaya.nexa.controller
 */
export default class App extends Controller {
  /*eslint-disable @typescript-eslint/no-empty-function*/
  public onInit(): void {
    const oModel = new JSONModel({
      layout: "TwoColumnsMidExpanded",
      acumulated: true,
      showDefectStatus: false,
      previousLayout: "",
      actionButtonsInfo: {
        midColumn: {
          fullScreen: false
        },
        endColumn: {
          fullScreen: false
        }
      }
    });

    this?.getView()?.setModel(oModel, "appView");
  }
}
