/* eslint-disable no-console */
import Select, { Select$ChangeEvent } from "sap/m/Select";
import { ToggleButton$PressEvent } from "sap/m/ToggleButton";
import UIComponent from "sap/ui/core/UIComponent";
import Controller from "sap/ui/core/mvc/Controller";
import Binding from "sap/ui/model/Binding";
import Filter from "sap/ui/model/Filter";
import ListBinding from "sap/ui/model/ListBinding";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Table from "sap/ui/table/Table";

/**
 * @namespace panaya.nexa.controller
 */
export default class Detail extends Controller {
  public _oldDueDate: undefined;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onInit(): void {
    const component = this.getOwnerComponent() as UIComponent;
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const oModelAppData = component.getModel("appData") as JSONModel;

    // eslint-disable-next-line no-eval
    const listBinding = eval(
      "new sap.ui.model.ListBinding(oModelAppData, '/')"
    ) as ListBinding;
    listBinding.attachChange(this.updateStepsdata.bind(this));

    const table = this.byId("stepsTable") as Table;
    // const oBinding = table.getBinding("rows") as Binding;


    const oModel = component.getModel() as ODataModel;
    oModel.attachBatchRequestSent(()=> {
      table.setBusy(true);
    });

    oModel.attachRequestCompleted(() => {
      table.setBusy(false);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public updateStepsdata() {
    const component = this.getOwnerComponent() as UIComponent;
    const oModelAppData = component.getModel("appData") as JSONModel;
    const appDate = oModelAppData.getProperty("/");

    if (this._oldDueDate === appDate.dueDate) {
      return;
    }

    this._oldDueDate = appDate.dueDate;

    const oFilter = new Filter("dueDate", "EQ", appDate.dueDate);
    const table = this.byId("stepsTable") as Table;

    interface ZBinding extends Binding {
      // eslint-disable-next-line @typescript-eslint/ban-types
      filter: Function;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aApplicationFilters: undefined | Array<any>;
    }

    const oBinding = table.getBinding("rows") as ZBinding; // Get the binding object
    
    let aFilters = oBinding.aApplicationFilters; // Get current filters (might be undefined initially)
    aFilters = aFilters || []; // Ensure it's an array

    const index = aFilters.findIndex((item) => item.sPath === "dueDate");
    if (index !== -1) {
      aFilters[index].oValue1 = appDate.dueDate;
    } else {
      aFilters = aFilters.concat(oFilter);
    }
    // Set the updated filters
    oBinding.filter(aFilters, "Application");
  }

  public onChangeStatus(oEvent: Select$ChangeEvent) {
    const selectedStatus = oEvent.getParameter("selectedItem")?.getKey();

    const oFilter = new Filter("status", "EQ", selectedStatus);
    const table = this.byId("stepsTable") as Table;

    interface ZBinding extends Binding {
      // eslint-disable-next-line @typescript-eslint/ban-types
      filter: Function;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aApplicationFilters: undefined | Array<any>;
    }

    const oBinding = table.getBinding("rows") as ZBinding; // Get the binding object
    let aFilters = oBinding.aApplicationFilters; // Get current filters (might be undefined initially)
    aFilters = aFilters || []; // Ensure it's an array

    const index = aFilters.findIndex((item) => item.sPath === "status");
    if (index !== -1) {
      if (selectedStatus === "Todos os Status") {
        aFilters.splice(index, 1);
      } else {
        aFilters[index].oValue1 = selectedStatus;
      }
    } else {
      aFilters = aFilters.concat(oFilter);
    }

    oBinding.filter(aFilters, "Application");
  }

  public onChangeDefectStatus(oEvent: Select$ChangeEvent) {
    const selectedStatus = oEvent.getParameter("selectedItem")?.getKey();

    const oFilter = new Filter("defectStatus", "EQ", selectedStatus);
    const table = this.byId("stepsTable") as Table;

    interface ZBinding extends Binding {
      // eslint-disable-next-line @typescript-eslint/ban-types
      filter: Function;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aApplicationFilters: undefined | Array<any>;
    }

    const oBinding = table.getBinding("rows") as ZBinding; // Get the binding object
    let aFilters = oBinding.aApplicationFilters; // Get current filters (might be undefined initially)
    aFilters = aFilters || []; // Ensure it's an array

    const index = aFilters.findIndex((item) => item.sPath === "defectStatus");
    if (index !== -1) {
      if (selectedStatus === "Todos os Status") {
        aFilters.splice(index, 1);
      } else {
        aFilters[index].oValue1 = selectedStatus;
      }
    } else {
      aFilters = aFilters.concat(oFilter);
    }

    oBinding.filter(aFilters, "Application");
  }

  public onPressOnlyCoe(oEvent: ToggleButton$PressEvent) {
    const pressed = oEvent.getParameter("pressed");
    let value;

    const table = this.byId("stepsTable") as Table;

    interface ZBinding extends Binding {
      // eslint-disable-next-line @typescript-eslint/ban-types
      filter: Function;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aApplicationFilters: undefined | Array<any>;
    }

    const oBinding = table.getBinding("rows") as ZBinding; // Get the binding object
    let aFilters = oBinding.aApplicationFilters; // Get current filters (might be undefined initially)
    aFilters = aFilters || []; // Ensure it's an array

    if (pressed) {
      value = "CoE";
      const oFilter = new Filter("team", "Contains", value);
      aFilters = aFilters.concat(oFilter);
    } else {
      const index = aFilters.findIndex(
        (item) => item.sPath === "team" && item.oValue1 === "CoE"
      );
      if (index !== -1) {
        aFilters.splice(index, 1);
      }
    }
    oBinding.filter(aFilters, "Application");
  }

  public onPressOnlyDefects(oEvent: ToggleButton$PressEvent) {
    const pressed = oEvent.getParameter("pressed");
    let value;
    const oModelAppView = this.getView()?.getModel("appView") as JSONModel;
    const appView = oModelAppView.getProperty("/");

    const table = this.byId("stepsTable") as Table;

    interface ZBinding extends Binding {
      // eslint-disable-next-line @typescript-eslint/ban-types
      filter: Function;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aApplicationFilters: undefined | Array<any>;
    }

    const oBinding = table.getBinding("rows") as ZBinding; // Get the binding object
    let aFilters = oBinding.aApplicationFilters; // Get current filters (might be undefined initially)
    aFilters = aFilters || []; // Ensure it's an array

    if (pressed) {
      appView.showDefectStatus = true;
      value = "";
      const oFilter = new Filter("defectId", "NE", value);
      aFilters = aFilters.concat(oFilter);
    } else {
      appView.showDefectStatus = false;
      const index = aFilters.findIndex(
        (item) => item.sPath === "defectId" && item.sOperator === "NE"
      );
      if (index !== -1) {
        aFilters.splice(index, 1);
      }
      const indexDefct = aFilters.findIndex(
        (item) => item.sPath === "defectStatus"
      );
      if (indexDefct !== -1) {
        aFilters.splice(indexDefct, 1);
      }
      const defctStatusSelect = this.byId("selectStatusDefct") as Select;
      defctStatusSelect.setSelectedKey("Todos os Status");
    }
    oModelAppView.setProperty("/",appView);
    oBinding.filter(aFilters, "Application");
  }

  public onToggleScreen() {
    const oModelAppView = this.getView()?.getModel("appView") as JSONModel;
    const appView = oModelAppView.getProperty("/");

    if (appView.layout === "TwoColumnsMidExpanded") {
      appView.layout = "MidColumnFullScreen";
    } else {
      appView.layout = "TwoColumnsMidExpanded";
    }

    oModelAppView.setProperty("/", appView);
  }

}
