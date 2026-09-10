jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("sap.ca.ui.model.format.AmountFormat");
jQuery.sap.require("sap.m.TablePersoController");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
jQuery.sap.require("PO_HISTORY.util.exportService");
jQuery.sap.require("PO_HISTORY.util.CSVGenerator");

sap.ui.core.mvc.Controller.extend("PO_HISTORY.view.Master", {
	_oCatalog: null,
	_oResourceBundle: null,

	onInit: function () {
		this._oView = this.getView();
		this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
		this._oResourceBundle = this._oComponent.getModel("i18n").getResourceBundle();
		this._oRouter = this._oComponent.getRouter();
		this._oCatalog = this._oView.byId("catalogTable");
		this._frgIdHierarchy = this._oView.getId() + "-hierarchy";
		this._frgIdPosteTechnique = this._oView.getId() + "-posteTechnique";
		this._frgIdEquipement = this._oView.getId() + "-equipement";

		// this._appType = "C";

		// this._appType = "C";
		// this._oView.byId("orderListPage").setTitle(this._oResourceBundle.getText("singleMasterTitle"));
		// this._oView.byId("col_workSche").setVisible(false);
		// this._oView.byId("col_tempsPrevu").setVisible(false);
		// if (this._oComponent.getComponentData()) {
		//   if (this._oComponent.getComponentData().startupParameters.apptype) {
		//     this._appType = this._oComponent.getComponentData().startupParameters.apptype[0];
		//     if (this._appType === "P") {
		this._oView.byId("orderListPage").setTitle(this._oResourceBundle.getText("orderListPageTitle"));
		//       this._oView.byId("col_workSche").setVisible(true);
		//       this._oView.byId("col_tempsPrevu").setVisible(true);
		//     }
		//   }
		// }

		this._initViewPropertiesModel();

		if (sap.ui.getCore().byId("homeBtn")) {
			sap.ui.getCore().byId("homeBtn").setVisible(false);
		}
		this.first = true;
		this.filters = [];
		this.tplnrFilters = [];
		this.initFilters();
		// var self = this;
		// this._oCatalog.addEventDelegate({
		// 	"onAfterRendering": function (evt) {
		// 		if (self.first) {
		// 			self.first = false;
		// 			self.onGoPressed();
		// 		}
		// 	}
		// }, this);

		document.addEventListener("deviceready", this.onDeviceReady, false);

		// this.onRefreshCount();
	},

	onInitGo: function () {
		if (this.first) {
			this.first = false;
			this.onGoPressed();
		}
	},

	initFilters: function () {
		var dateDeb = new Date();
		dateDeb.setDate(dateDeb.getDate() - 1);
		var dateFin = new Date();
		this.getView().byId("filtre_documentDateDeb").setDateValue(dateDeb);
		this.getView().byId("filtre_documentDateFin").setDateValue(dateFin);
		// var documentDateFrom = this.getView().byId("filtre_documentDateDeb");
		// var documentDateTo = this.getView().byId("filtre_documentDateFin");
		// var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
		// 	pattern: "yyyy-MM-ddTKK:mm:ss"
		// });
		// var filter = [];

		// if (documentDateFrom.getDateValue()) {
		// 	var begda = documentDateFrom.getDateValue();
		// 	var newBegda = new Date(begda);
		// 	// newBegda.setMinutes(newBegda.getMinutes() - newBegda.getTimezoneOffset());
		// 	var dateDebStr = dateFormat.format(newBegda);
		// 	filter.push(new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, dateDebStr));
		// }
		// if (documentDateTo.getDateValue()) {
		// 	var endda = documentDateTo.getDateValue();
		// 	var newEndda = new Date(endda);
		// 	// newEndda.setMinutes(newEndda.getMinutes() - newEndda.getTimezoneOffset());
		// 	var dateFinStr = dateFormat.format(newEndda);
		// 	filter.push(new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, dateFinStr));
		// }
		// if (filter) {
		// 	this._oCatalog.getBinding("items").filter(filter);
		// 	this.filters = filter;
		// }

	},

	onDeviceReady: function () {},

	onAfterRendering: function () {
		// Bind Master table
		// var filters = [new sap.ui.model.Filter("Apptype", sap.ui.model.FilterOperator.Contains, this._appType)];
		// this._oCatalog.getBinding("items").filter(filters);
		// this.filters = filters;
		if (this.first) {
			this.onRefreshCount();
			this.onGoPressed();
			this.first = false;
		}
		var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
		// if (sLocale !== "fr") {
		// 	this.getView().byId("filtre_documentDateDeb").setDisplayFormat("MM/dd/yyyy");
		// 	this.getView().byId("filtre_documentDateFin").setDisplayFormat("MM/dd/yyyy");
		// 	this.getView().byId("filtre_documentDateDeb").setPlaceholder("MM/dd/yyyy");
		// 	this.getView().byId("filtre_documentDateFin").setPlaceholder("MM/dd/yyyy");
		// }
	},

	// The model created here is used to set values or view element properties that cannot be bound
	// directly to the OData service. Setting view element attributes by binding them to a model is preferable to the
	// alternative of getting each view element by its ID and setting the values directly because a JSon model is more
	// robust if the customer removes view elements (see extensibility).
	_initViewPropertiesModel: function () {
		var oViewElemProperties = {};
		oViewElemProperties.catalogTitleText = "";
		if (sap.ui.Device.system.phone) {
			oViewElemProperties.availabilityColumnWidth = "80%";
			oViewElemProperties.pictureColumnWidth = "5rem";
			oViewElemProperties.btnColHeaderVisible = true;
			oViewElemProperties.searchFieldWidth = "100%";
			oViewElemProperties.catalogTitleVisible = false;
			// in phone mode the spacer is removed in order to increase the size of the search field
			this.byId("tableToolbar").removeContent(this.byId("toolbarSpacer"));
		} else {
			oViewElemProperties.availabilityColumnWidth = "18%";
			oViewElemProperties.pictureColumnWidth = "9%";
			oViewElemProperties.btnColHeaderVisible = false;
			oViewElemProperties.searchFieldWidth = "30%";
			oViewElemProperties.catalogTitleVisible = true;
			oViewElemProperties.smallWidth = "8%";
			oViewElemProperties.normalWidth = "12%";
			oViewElemProperties.largeWidth = "18%";
		}
		// TODO: Alimenter les données ici
		this._oViewProperties = new sap.ui.model.json.JSONModel(oViewElemProperties);
		this._oView.setModel(this._oViewProperties, "viewProperties");
	},

	onNavBack: function () {
		// window.history.go(-1);
		var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
		oCrossAppNavigator.toExternal({
			target: {
				semanticObject: "#"
			}
		});
	},

	/******************************************** List Handling ********************************************/
	// Handler method for the table search.
	onSearchPressed: function () {
		// : fonction de recherche à implémenter
		var sValue = this.byId("searchField").getValue();
		var filters = this.buildFilter();
		// var filters = [];
		//filters.push(new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.Contains, encodeURIComponent("*" + sValue)));
		//filters.push(new sap.ui.model.Filter("Ktext", sap.ui.model.FilterOperator.Contains, encodeURIComponent("*" + sValue)));
		filters.push(new sap.ui.model.Filter("Ktext", sap.ui.model.FilterOperator.Contains, "*" + sValue));
		// filters.push(new sap.ui.model.Filter("Apptype", sap.ui.model.FilterOperator.Contains, this._appType));
		var oBinding = this._oCatalog.getBinding("items");
		oBinding.filter(filters);
		// this.filters = filters;
	},

	// --- Navigation
	onLineItemPressed: function (oEvent) {
		this._oRouter.navTo("details", {
			from: "main",
			entity: oEvent.getSource().getBindingContext().getPath().substr(1),
			tab: null
		});
	},

	buildFilter: function () {
		var typeMoyen = this.getView().byId("filtre_typeMoyen");
		var selTypeTravaux = this.getView().byId("filtre_typeTravaux");
		var selWorkGroup = this.getView().byId("filtre_group");
		var selEmeteur = this.getView().byId("filtre_emeteur");
		var selIntervenant = this.getView().byId("filtre_intervenant");
		var documentDateFrom = this.getView().byId("filtre_documentDateDeb");
		var documentDateTo = this.getView().byId("filtre_documentDateFin");
		// var selActType = this.getView().byId("filtre_typeActivite");
		var typeOrder = this.getView().byId("filtre_typeOrdre");
		var filter = [];
		// filter.push(new sap.ui.model.Filter("Priok", sap.ui.model.FilterOperator.Contains, selPriorite.getSelectedKey()));
		var flagError = false;
		documentDateFrom.setValueState("None");
		documentDateTo.setValueState("None");

		if (!documentDateFrom.getDateValue()) {
			documentDateFrom.setValueState("Error");
			flagError = true;
			return;
		}
		if (!documentDateTo.getDateValue()) {
			if (documentDateFrom.getDateValue()) {
				documentDateTo.setDateValue(documentDateFrom.getDateValue());
			} else {
				documentDateTo.setValueState("Error");
				flagError = true;
			}
		} else {
			if (documentDateFrom.getDateValue().getTime() > documentDateTo.getDateValue().getTime()) {

				documentDateTo.setValueState("Error");
				flagError = true;
			}
		}

		if (flagError) {
			return;
		}

		var sHier = this.getOwnerComponent().getModel("selectedTplnr").getProperty("/selectedKey");
		var sTplnr;
		if (!sTplnr) {
			sTplnr = typeMoyen.getSelectedKey();
		}
		if (sHier) {
			if (this._tmpObjTypeSelected === "E") {
				filter.push(new sap.ui.model.Filter("Tplnr", sap.ui.model.FilterOperator.Contains, sTplnr));
				filter.push(new sap.ui.model.Filter("Equnr", sap.ui.model.FilterOperator.Contains, sHier));
			} else {
				filter.push(new sap.ui.model.Filter("Tplnr", sap.ui.model.FilterOperator.Contains, sHier));
			}
		} else {
			filter.push(new sap.ui.model.Filter("Tplnr", sap.ui.model.FilterOperator.Contains, sTplnr));
		}
		if (selTypeTravaux.getSelectedItem()) {
			filter.push(new sap.ui.model.Filter("Urcod", sap.ui.model.FilterOperator.Contains, selTypeTravaux.getSelectedKey()));
		}
		if (selWorkGroup.getSelectedItem()) {
			filter.push(new sap.ui.model.Filter("Urgrp", sap.ui.model.FilterOperator.Contains, selWorkGroup.getSelectedKey()));
		}
		// if (selActType.getSelectedItem()) {
		// 	filter.push(new sap.ui.model.Filter("Ilart", sap.ui.model.FilterOperator.Contains, selActType.getSelectedKey()));
		// }
		if (typeOrder.getSelectedItem()) {
			filter.push(new sap.ui.model.Filter("OrderType", sap.ui.model.FilterOperator.Contains, typeOrder.getSelectedKey()));
		}
		// if (selEmeteur.getSelectedItem()) {
		// 	filter.push(new sap.ui.model.Filter("Qmnam", sap.ui.model.FilterOperator.Contains, selEmeteur.getSelectedItem().getText()));
		// } else {
		// 	filter.push(new sap.ui.model.Filter("Qmnam", sap.ui.model.FilterOperator.Contains, ""));
		// }
		if (selEmeteur.getValue()) {
			filter.push(new sap.ui.model.Filter("Qmnam", sap.ui.model.FilterOperator.Contains, selEmeteur.getValue()));
		} else {
			filter.push(new sap.ui.model.Filter("Qmnam", sap.ui.model.FilterOperator.Contains, ""));
		}

		filter.push(new sap.ui.model.Filter("Qmnam", sap.ui.model.FilterOperator.Contains, selIntervenant.getSelectedKey()));
		// if (this._filterPosteName) {
		// 	filter.push(new sap.ui.model.Filter("Tplnr", sap.ui.model.FilterOperator.Contains, this._filterPosteName));
		// }
		// if (this._filterEquipementName) {
		// 	filter.push(new sap.ui.model.Filter("Equnr", sap.ui.model.FilterOperator.Contains, this._filterEquipementName));
		// }
		var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
			pattern: "yyyy-MM-ddTHH:mm:ss"
		});
		// if (documentDateFrom.getDateValue()) {
		// 	var begda = documentDateFrom.getDateValue();
		// 	begda.setMinutes(begda.getMinutes() - begda.getTimezoneOffset());
		// 	var dateDebStr = dateFormat.format(begda);
		// 	filter.push(new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, dateDebStr));
		// }
		// if (documentDateTo.getDateValue()) {
		// 	var endda = documentDateTo.getDateValue();
		// 	endda.setMinutes(endda.getMinutes() - endda.getTimezoneOffset());
		// 	var dateFinStr = dateFormat.format(endda);
		// 	filter.push(new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, dateFinStr));
		// }
		if (documentDateFrom.getDateValue()) {
			var begda = documentDateFrom.getDateValue();
			var newBegda = new Date(begda);
			// newBegda.setMinutes(newBegda.getMinutes() - newBegda.getTimezoneOffset());
			newBegda.setHours(12);
			var dateDebStr = dateFormat.format(newBegda);
			filter.push(new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, dateDebStr));
		}
		if (documentDateTo.getDateValue()) {
			var endda = documentDateTo.getDateValue();
			var newEndda = new Date(endda);
			// newEndda.setMinutes(newEndda.getMinutes() - newEndda.getTimezoneOffset());
			newEndda.setHours(12);
			var dateFinStr = dateFormat.format(newEndda);
			filter.push(new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, dateFinStr));
		}
		return filter;
	},

	// Bouton GO
	onGoPressed: function () {
		//Filter table by user input
		// var selPriorite = this.getView().byId("filtre_priorite");
		var filter = this.buildFilter();
		// filter.push(new sap.ui.model.Filter("Apptype", sap.ui.model.FilterOperator.Contains, this._appType));
		var sValue = this.byId("searchField").getValue();
		filter.push(new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.Contains, encodeURIComponent("*" + sValue)));
		if (filter) {
			this._oCatalog.getBinding("items").filter(filter);
			this.filters = filter;
		}
	},

	// Handler quand on clique sur le filtre Poste Technique
	onPosteTechniqueValueHelpRequest: function () {
		if (!this._oPosteTechniqueDialog) {
			this._oPosteTechniqueDialog = sap.ui.xmlfragment(this._frgIdPosteTechnique,
				"PO_HISTORY.view.fragment.PosteTechniqueDialog", this);
			this._oPosteTechniqueDialog.setModel(this.getView().getModel());
		}
		//Manage data source
		var filters = [];
		// filters.push(new sap.ui.model.Filter("Apptype", sap.ui.model.FilterOperator.Contains, this._appType));
		filters.push(new sap.ui.model.Filter("ObjectType", sap.ui.model.FilterOperator.Contains, "F"));
		this._oPosteTechniqueDialog.getBinding("items").filter(filters);
		this._oPosteTechniqueDialog.open();
	},

	// Handler quand on clique sur le filtre Equipement
	onEquipementValueHelpRequest: function () {
		if (!this._oEquipementDialog) {
			this._oEquipementDialog = sap.ui.xmlfragment(this._frgIdEquipement, "PO_HISTORY.view.fragment.EquipmentDialog", this);
			this._oEquipementDialog.setModel(this.getView().getModel());
		}
		//Manage data source
		var filters = [];
		// filters.push(new sap.ui.model.Filter("Apptype", sap.ui.model.FilterOperator.Contains, this._appType));
		filters.push(new sap.ui.model.Filter("ObjectType", sap.ui.model.FilterOperator.Contains, "E"));
		this._oEquipementDialog.getBinding("items").filter(filters);
		this._oEquipementDialog.open();
	},

	// handleEquipementDialogSearch: function(oEvent) {
	//  var sValue = oEvent.getParameter("value");
	//  var oFilter = new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, sValue);
	//  var oBinding = oEvent.getSource().getBinding("items");
	//  oBinding.filter([oFilter]);
	// },

	handleEquipementDialogClose: function (oEvent) {
		var aContexts = oEvent.getParameter("selectedContexts");
		if (aContexts.length) {
			var choosed = aContexts.map(function (oContext) {
				return oContext.getObject();
			});
			this.getView().byId("filtre_equipement").setValue(choosed[0].Description);
			this._filterEquipementName = choosed[0].Equnr;
		}
		oEvent.getSource().getBinding("items").filter([]);
	},

	// handlePosteTechniqueDialogSearch: function(oEvent) {
	//  var sValue = oEvent.getParameter("value");
	//  var oFilter = new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, sValue);
	//  var oBinding = oEvent.getSource().getBinding("items");
	//  oBinding.filter([oFilter]);
	// },

	handlePosteTechniqueDialogClose: function (oEvent) {
		var aContexts = oEvent.getParameter("selectedContexts");
		if (aContexts.length) {
			var choosed = aContexts.map(function (oContext) {
				return oContext.getObject();
			});
			this.getView().byId("filtre_posteTechnique").setValue(choosed[0].Description);
			this._filterPosteName = choosed[0].Tplnr;
		}
		oEvent.getSource().getBinding("items").filter([]);
	},

	onResetPressed: function () {
		// this.getView().byId("filtre_priorite").setSelectedKey();
		// this.getView().byId("filtre_typeActivite").setSelectedKey();
		this.getView().byId("filtre_typeOrdre").setSelectedKey();
		this.getView().byId("filtre_typeMoyen").setSelectedKey();
		this.getView().byId("filtre_hierarchie").setValue();
		this.getView().byId("filtre_group").setSelectedKey();
		this.getView().byId("filtre_typeTravaux").setSelectedKey();
		// this.getView().byId("filtre_emeteur").setSelectedKey();
		this.getView().byId("filtre_emeteur").setValue();
		this.getView().byId("filtre_intervenant").setSelectedKey();
		this.getView().byId("filtre_documentDateDeb").setDateValue();
		this.getView().byId("filtre_documentDateFin").setDateValue();
		this.getView().byId("searchField").setValue();

		this.getOwnerComponent().getModel("selectedTplnr").setData({
			"value": "",
			"key": "",
			"selectedKey": ""
		});
		// this.getView().byId("filtre_posteTechnique").setValue();
		// this.getView().byId("filtre_equipement").setValue();
		this._filterPosteName = "";
		this._filterEquipementName = "";
		var filter = [];
		// filter.push(new sap.ui.model.Filter("Apptype", sap.ui.model.FilterOperator.Contains, this._appType));
		this._oCatalog.getBinding("items").filter(filter);
		this.getView().byId("filtre_typeTravaux").setEnabled(false);
		this.getView().byId("filtre_hierarchie").setEnabled(false);
	},

	onExportPressed: sap.m.Table.prototype.exportData || function (oEvent) {

		var oContexts = this._oCatalog.getBinding("items").getContexts();
		var oModel = this.getView().getModel();
		var oData = {
			"results": []
		};

		for (var i in oContexts) {
			// oData.results.push(oModel.getProperty(oContexts[i].getPath()));
			oData.results.push({
				"Order": oModel.getProperty(oContexts[i].getPath()).Aufnr,
				"Description": oModel.getProperty(oContexts[i].getPath()).Ktext,
				"Equipment": oModel.getProperty(oContexts[i].getPath()).Equnr,
				"EquipmentText": oModel.getProperty(oContexts[i].getPath()).Equnrtxt,
				"FunctionalLocation": oModel.getProperty(oContexts[i].getPath()).Tplnr,
				"FunctionalLocationText": oModel.getProperty(oContexts[i].getPath()).Tplnrtxt,
				"WorkType": oModel.getProperty(oContexts[i].getPath()).Kurztext,
				"Date": (!oModel.getProperty(oContexts[i].getPath()).Date) ? "" : oModel.getProperty(oContexts[i].getPath()).Date.toISOString().substring(
					0, 10),
				"ClosedDate": (!oModel.getProperty(oContexts[i].getPath()).CloDate) ? "" : oModel.getProperty(oContexts[i].getPath()).CloDate.toISOString()
					.substring(0, 10)
			});
		}

		var oJsonModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel("export", oJsonModel);

		oJsonModel.setData(oData);

		// 1
		var fileName = "log_maint_history.csv";
		// var oCSVGenerator = new PO_HISTORY.util.CSVGenerator();

		// oCSVGenerator.generate(oData.results);
		// oCSVGenerator.download(fileName);

		// 2
		if (!sap.ui.Device.system.desktop) {
			var oCSVGenerator = new PO_HISTORY.util.CSVGenerator();
			oCSVGenerator.generate(oData.results);
			var rows = oCSVGenerator.getCsvRows();

			var FileSystemHandler = new PO_HISTORY.util.exportService();
			FileSystemHandler.writeFileContent(fileName, "csv", rows,
				function (f) {
					// me._log("Success Writing af file details :");
					// me._log(f);
					// me._log("opening URL "+f.toURL());
					window.open(f.toURL());
				},
				function (error) {
					alert("error" + JSON.stringify(error));
				});
		} else {

			// 3
			var sep = (sap.ui.getCore().getConfiguration().getLanguage() === "fr") ? ";" : ",";
			var oExport = new sap.ui.core.util.Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new sap.ui.core.util.ExportTypeCSV({
					separatorChar: sep
				}),

				// Pass in the model created above
				models: oJsonModel,

				// binding information for the rows aggregation
				rows: {
					path: "/results"
				},

				// column definitions with column name and binding info for the content

				columns: [{
					name: "Order",
					template: {
						content: "{Order}"
					}
				}, {
					name: "Description",
					template: {
						content: {
							parts: ["Description"],
							formatter: function (sValue) {
								if (sValue) {
									return sValue.replace("\n", " ");
								}
							}
						}
					}
				}, {
					name: "Equipment number",
					template: {
						content: "{Equipment}"
					}
				}, {
					name: "Equipment Text",
					template: {
						content: "{EquipmentText}"
					}
				}, {
					name: "Functional location",
					template: {
						content: "{FunctionalLocation}"
					}
				}, {
					name: "Functional location text",
					template: {
						content: "{FunctionalLocationText}"
					}
				}, {
					name: "Work Type",
					template: {
						content: "{WorkType}"
					}
				}, {
					name: "Date",
					template: {
						content: "{Date}"
					}
				}, {
					name: "Closed date",
					template: {
						content: "{ClosedDate}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function (oError) {
				sap.m.MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		}
	},

	//Formatter
	formatDesc: function (sValue) {
		return sValue.replace('\n', ' ');
	},
	removeLeadingZeros: function (text) {
		return text.replace(/^0+/, "");
	},
	handleTypeMoyenChange: function (oEvent) {
		this.getView().byId("filtre_hierarchie").setEnabled(true);
		this.getView().byId("filtre_hierarchie").setValue();
		var selectedKey = oEvent.getSource().getSelectedKey();
		var selectedValue = oEvent.getSource().getValue();
		var filters = [];
		filters.push(new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.EQ, selectedKey));
		// this.getView().byId("filtre_hierarchie").getBinding("items").filter(filters);

		this.getOwnerComponent().getModel("selectedTplnr").setProperty("/value", selectedValue);
		this.getOwnerComponent().getModel("selectedTplnr").setProperty("/key", selectedKey);
		this.getOwnerComponent().getModel("selectedTplnr").setProperty("/selectedKey", selectedKey);

	},

	onHierarchyValueHelp: function () {
		if (!this._oHierarchyDialog) {
			this._oHierarchyDialog = sap.ui.xmlfragment(this._frgIdHierarchy,
				"PO_HISTORY.view.fragment.hierarchyDialog", this);
			this._oHierarchyDialog.setModel(this.getView().getModel());
			this._oHierarchyDialog.setModel(this.getOwnerComponent().getModel("selectedTplnr"), "selectedTplnr");
			this._oHierarchyDialog.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
		}
		var filters = [];
		var nameSelected = this.getOwnerComponent().getModel("selectedTplnr").getProperty("/key");
		var filterName = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, nameSelected);
		filters.push(filterName);
		sap.ui.core.Fragment.byId(this._frgIdHierarchy, "list").getBinding("items").filter(filters);
		// Also send ObjectType to OData service for navigation path filtering
		var objTypeSelected = "F";
		if (!this._tmpObjTypeSelected) { 
			objTypeSelected = "F";
			this._tmpObjTypeSelected = "F";
		} else {
			objTypeSelected = this._tmpObjTypeSelected;
		}
		var filterObjType = new sap.ui.model.Filter("ObjType", sap.ui.model.FilterOperator.Contains, objTypeSelected);
		filters.push(filterObjType);
		sap.ui.core.Fragment.byId(this._frgIdHierarchy, "listNav").getBinding("items").filter(filters);

		this._oHierarchyDialog.open();
	},

	onConfirmHierarchy: function () {
		var sValue = this.getOwnerComponent().getModel("selectedTplnr").getProperty("/value");
		var sKey = this.getOwnerComponent().getModel("selectedTplnr").getProperty("/key");
		this.getOwnerComponent().getModel("selectedTplnr").setProperty("/selectedKey", sKey);
		this.getView().byId("filtre_hierarchie").setValue(sValue);

		this.handleHierarchyDialogClose();
	},

	handleHierarchyDialogClose: function () {
		this._oHierarchyDialog.close();
	},

	onSelect: function () {
		sap.ui.core.Fragment.byId(this._frgIdHierarchy, "listNav").removeSelections(true);
		var selectedItem = sap.ui.core.Fragment.byId(this._frgIdHierarchy, "list").getSelectedItem();
		//Navigation to sub items
		// var lowerLevel = selectedItem.data("lowerLevel");
		// if (lowerLevel === "X") {
		var filters = [];
		var nameSelected = selectedItem.getBindingContext().toString();
		nameSelected = nameSelected.split("'")[1];
		if (nameSelected && nameSelected.length > 0) {
			var filterName = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, nameSelected);
			filters.push(filterName);
			sap.ui.core.Fragment.byId(this._frgIdHierarchy, "list").getBinding("items").filter(filters);
			// Also send ObjectType to OData service for navigation path filtering
			var objTypeSelected = selectedItem.data("objType");
			// this._tmpObjTypeSelected = "F";
			this._tmpObjTypeSelected = objTypeSelected;
			var filterObjType = new sap.ui.model.Filter("ObjType", sap.ui.model.FilterOperator.Contains, objTypeSelected);
			filters.push(filterObjType);
			sap.ui.core.Fragment.byId(this._frgIdHierarchy, "listNav").getBinding("items").filter(filters);
		}
		// }

		var value = selectedItem.getTitle();
		var key = selectedItem.getBindingContext().toString();
		key = key.split("'")[1];

		this.getOwnerComponent().getModel("selectedTplnr").setProperty("/value", value);
		this.getOwnerComponent().getModel("selectedTplnr").setProperty("/key", key);
	},

	//Navigation path selected event
	onSelectNav: function () {
		sap.ui.core.Fragment.byId(this._frgIdHierarchy, "list").removeSelections(true);
		var selectedItem = sap.ui.core.Fragment.byId(this._frgIdHierarchy, "listNav").getSelectedItem();
		// window._logo = selectedItem.data("base64");
		var filters = [];
		var nameSelected = selectedItem.data("name");
		if (nameSelected && nameSelected.length > 0) {
			var filterName = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, nameSelected);
			filters.push(filterName);
			sap.ui.core.Fragment.byId(this._frgIdHierarchy, "list").getBinding("items").filter(filters);
			var objTypeSelected = this._tmpObjTypeSelected;
			var filterObjType = new sap.ui.model.Filter("ObjType", sap.ui.model.FilterOperator.Contains, objTypeSelected);
			filters.push(filterObjType);
			sap.ui.core.Fragment.byId(this._frgIdHierarchy, "listNav").getBinding("items").filter(filters);
		}

		// var value = selectedItem.getTitle();
		var key = selectedItem.data("name");

		var oData = this.getOwnerComponent().getModel().getProperty("/FUNCLEVELSet('" + key + "')");
		if (oData) {
			this.getOwnerComponent().getModel("selectedTplnr").setProperty("/key", key);
			this.getOwnerComponent().getModel("selectedTplnr").setProperty("/value", oData.Description);
		}
		// var orderAllowed = this.getView().getModel().getProperty("/FUNCLEVELSet('" + nameSelected + "')/OrderAllowed");
		// if (orderAllowed === "X") {
		// 	this._oEventBus.publish("Master", "ShowCanvas");
		// } else {
		// 	this._oEventBus.publish("Master", "ShowLogo");
		// }
		// window._postDescription = selectedItem.getTitle();
		// window._equipeDescription = "";
	},

	handleWorkGroupChange: function (oEvent) {
		this.getView().byId("filtre_typeTravaux").setEnabled(true);
		this.getView().byId("filtre_typeTravaux").setSelectedItem(null);
		var selectedKey = oEvent.getParameter("selectedItem").getKey();
		var filters = [];
		filters.push(new sap.ui.model.Filter("Codegruppe", sap.ui.model.FilterOperator.EQ, selectedKey));
		this.getView().byId("filtre_typeTravaux").getBinding("items").filter(filters);
	},

	onRefreshCount: function () {
		// this.getModel("settingModel").setProperty("/worklistCount", this.byId("catalogTable").getBinding("rows").getLength());
		var self = this;
		var oBinding = this._oCatalog.getBinding("items");
		oBinding.attachChange(function () {
			self.getOwnerComponent().getModel("settingModel").setProperty("/worklistCount", oBinding.iLength);
		}.bind(this));
	},

	formatDate: function (sDate) {
		var sNewDate = new Date(sDate);
		sNewDate.setMinutes(sNewDate.getMinutes() + sNewDate.getTimezoneOffset());
		return sNewDate;
	},

});