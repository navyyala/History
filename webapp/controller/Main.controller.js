sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device"
], function (Controller, Device) {
	"use strict";

	return Controller.extend("PO_HISTORY.controller.Main", {

		onInit: function () {
			if (Device.support.touch === false) {
				this.getView().addStyleClass("sapUiSizeCompact");
			}
		}
	});
});
