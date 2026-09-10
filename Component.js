// define a root UI component that exposes the main view
jQuery.sap.declare("PO_HISTORY.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.History");
jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
sap.ui.core.UIComponent.extend("PO_HISTORY.Component", {
	metadata: {
		"name": "PO_HISTORY",
		"version": "1.1.0-SNAPSHOT",
		"library": "PO_HISTORY",
		"includes": ["css/fullScreenStyles.css"],
		"dependencies": {
			"ui5version": "1.28.31",
			"libs": [
				"sap.m",
				"sap.ui.layout"
			],
			"components": []
		},
		"config": {
			"resourceBundle": "i18n/messageBundle.properties",
			"serviceConfig": {
				"name": "ZGPM_ORDER_HISTORY_SRV",
				"serviceUrl": "/sap/opu/odata/sap/ZGPM_ORDER_HISTORY_SRV/"
			}
		},
		routing: {
			// The default values for routes
			config: {
				"viewType": "XML",
				"viewPath": "PO_HISTORY.view",
				"targetControl": "fioriContent",
				// This is the control in which new views are placed
				"targetAggregation": "pages",
				// This is the aggregation in which the new views will be placed
				"clearTarget": false
			},
			routes: [{
				pattern: "",
				name: "main",
				view: "Master"
			}, {
				name: "details",
				view: "Details",
				pattern: "{entity}"
			}]
		}
	},
	/**
	 * Initialize the application
	 *
	 * @returns {sap.ui.core.Control} the content
	 */
	createContent: function () {
		var oViewData = {
			component: this
		};
		return sap.ui.view({
			viewName: "PO_HISTORY.view.Main",
			type: sap.ui.core.mvc.ViewType.XML,
			viewData: oViewData
		});
	},
	init: function () {
		// call super init (will call function "create content")
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		// always use absolute paths relative to our own component
		// (relative paths will fail if running in the Fiori Launchpad)
		var sRootPath = jQuery.sap.getModulePath("PO_HISTORY");
		// The service URL for the oData model 
		var oServiceConfig = this.getMetadata().getConfig().serviceConfig;
		var sServiceUrl = oServiceConfig.serviceUrl;
		// the metadata is read to get the location of the i18n language files later
		var mConfig = this.getMetadata().getConfig();
		this._routeMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter(), this._bRouterCloseDialogs);
		// create oData model
		this._initODataModel(sServiceUrl);
		// set i18n model
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: [
				sRootPath,
				mConfig.resourceBundle
			].join("/")
		});
		this.setModel(i18nModel, "i18n");
		// initialize router and navigate to the first page
		this.getRouter().initialize();
		// Initialize setting model
		var jSettingModel = new sap.ui.model.json.JSONModel();
		this.setModel(jSettingModel, "settingModel");
		var jSettingModelData = {
			"worklistIsBusy": true,
			"worklistCount": 0
		};
		jSettingModel.setData(jSettingModelData);
		var jSelectedTplnr = new sap.ui.model.json.JSONModel();
		this.setModel(jSelectedTplnr, "selectedTplnr");
		var jSelectedTplnrData = {
			"value": "",
			"key": "",
			"selectedKey": ""
		};
		jSelectedTplnr.setData(jSelectedTplnrData);
		this.getModel().setSizeLimit(300);
	},
	exit: function () {
		this._routeMatchedHandler.destroy();
	},
	// This method lets the app can decide if a navigation closes all open dialogs
	setRouterSetCloseDialogs: function (bCloseDialogs) {
		this._bRouterCloseDialogs = bCloseDialogs;
		if (this._routeMatchedHandler) {
			this._routeMatchedHandler.setCloseDialogs(bCloseDialogs);
		}
	},
	// creation and setup of the oData model
	_initODataModel: function (sServiceUrl) {
		jQuery.sap.require("PO_HISTORY.util.messages");
		jQuery.sap.require("PO_HISTORY.util.exportService");
		var oConfig = {
			metadataUrlParams: {},
			json: true,
			// loadMetadataAsync : true,
			defaultBindingMode: "TwoWay",
			defaultCountMode: "Inline",
			useBatch: true
		};
		var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, oConfig);
		oModel.attachRequestFailed(null, PO_HISTORY.util.messages.showErrorMessage);
		this.setModel(oModel);
		//Odata v2 model
		var oOrderItemModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl);
		this.setModel(oOrderItemModel, "orderitem");
	}
});