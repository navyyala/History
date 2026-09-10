sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/routing/RouteMatchedHandler",
	"PO_HISTORY/util/messages"
], function (UIComponent, JSONModel, RouteMatchedHandler, messages) {
	"use strict";

	return UIComponent.extend("PO_HISTORY.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * Initialize the application. Models declared in manifest.json (default v1 OData
		 * model, "orderitem" v2 OData model, "i18n") are created automatically by
		 * UIComponent based on manifest: "json". This init only wires up behavior that
		 * cannot be expressed declaratively (error handling, router-close-dialogs handler,
		 * and the two ad-hoc JSON view-state models used by the Master view).
		 */
		init: function () {
			// call super init (creates models/router declared in manifest.json)
			UIComponent.prototype.init.apply(this, arguments);

			this._routeMatchedHandler = new RouteMatchedHandler(this.getRouter(), this._bRouterCloseDialogs);

			// Preserve legacy request-failed error handling on the default (v1) OData model
			var oModel = this.getModel();
			if (oModel && oModel.attachRequestFailed) {
				oModel.attachRequestFailed(null, messages.showErrorMessage);
			}
			if (oModel && oModel.setSizeLimit) {
				oModel.setSizeLimit(300);
			}

			// Initialize setting model
			var jSettingModel = new JSONModel({
				"worklistIsBusy": true,
				"worklistCount": 0
			});
			this.setModel(jSettingModel, "settingModel");

			// Initialize selected functional-location hierarchy model
			var jSelectedTplnr = new JSONModel({
				"value": "",
				"key": "",
				"selectedKey": ""
			});
			this.setModel(jSelectedTplnr, "selectedTplnr");

			// initialize router and navigate to the first page
			this.getRouter().initialize();
		},

		exit: function () {
			this._routeMatchedHandler.destroy();
		},

		// This method lets the app decide if a navigation closes all open dialogs
		setRouterSetCloseDialogs: function (bCloseDialogs) {
			this._bRouterCloseDialogs = bCloseDialogs;
			if (this._routeMatchedHandler) {
				this._routeMatchedHandler.setCloseDialogs(bCloseDialogs);
			}
		}

	});
});
