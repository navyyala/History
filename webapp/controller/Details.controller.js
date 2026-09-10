sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ca/ui/model/format/AmountFormat",
	"sap/m/MessageBox",
	"PO_HISTORY/util/stockOutputHelper"
], function(Controller, AmountFormat, MessageBox, stockOutputHelper) {
	"use strict";

	return Controller.extend("PO_HISTORY.controller.Details", {
		_sItemPath: "",
		_sNavigationPath: "",
		_oResourceBundle: null,
		stockOutputHelper: stockOutputHelper,
		onInit: function() {
			this._oView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			this._oRouter = this._oComponent.getRouter();
			this._frgIdItems = this._oView.getId() + "-items";
			this._frgIdAttachments = this._oView.getId() + "-attachments";
			this._frgIdDetails = this._oView.getId() + "-details";
			this._frgIdArticles = this._oView.getId() + "-articles";
			this._frgIdEditItemDialog = this._oView.getId() + "-editItemDialog";
			this._frgIdAddArticleDialog = this._oView.getId() + "-addArticleDialog";
			this._frgIdSearchArticleDialog = this._oView.getId() + "-searchArticleDialog";
			this._frgItems = sap.ui.xmlfragment(this._frgIdItems, "PO_HISTORY.view.fragment.items", this);
			this._frgAttachments = sap.ui.xmlfragment(this._frgIdAttachments, "PO_HISTORY.view.fragment.attachments", this);
			this._frgDetails = sap.ui.xmlfragment(this._frgIdDetails, "PO_HISTORY.view.fragment.details", this);
			this._frgArticles = sap.ui.xmlfragment(this._frgIdArticles, "PO_HISTORY.view.fragment.articlesConso", this);
			this.oView.byId("filterItems").addContent(this._frgItems);
			this.oView.byId("filterAttachment").addContent(this._frgAttachments);
			// this.oView.byId("filterDetails").addContent(this._frgDetails);
			this.oView.byId("filterArticles").addContent(this._frgArticles);
			this._oResourceBundle = this._oComponent.getModel("i18n").getResourceBundle();
			// Get Context Path for Page 2 Screen
			this._oRouter.attachRoutePatternMatched(this._onRoutePatternMatched, this);
		},
		// onAfterRendering: function() {
		// 	// hide poke yoke, safety and status
		// 	this._oView.byId("num_tempsArret").setValue();
		// },
		_onRoutePatternMatched: function(oEvent) {
			if (oEvent.getParameter("name") !== "details") {
				return;
			}
			this._sItemPath = "/" + oEvent.getParameters().arguments.entity;
			this._sNavigationPath = this._sItemPath + "/" + "";
			// Bind Object Header and Form using oData
			this.byId("DetailsPage").bindElement({
				path: this._sItemPath
			});

			// JII 3786
			var orderType = this.getView().getModel().getProperty(this._sItemPath + "/OrderType");
			if (orderType === "ZM17") {
				this.getView().byId("hboxstartdateid").setVisible(true);

				var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
				var timevalue = this.getView().getModel().getProperty(this._sItemPath + "/Brkdwnstarttime");
				//var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: "HH:mm:ss"}); 
				//var timeStr = timeFormat.format(new Date(timevalue.ms + TZOffsetMs));
				this.getView().byId("breakdownstarttimeid").setValue(timevalue);

				var datevalue = this.getView().getModel().getProperty(this._sItemPath + "/Brkdwnstartdate");
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd.MM.yyyy"
				});
				var dateStr = dateFormat.format(new Date(datevalue.getTime() + TZOffsetMs));
				this.getView().byId("breakdownstartdateid").setText(dateStr);
			} else {
				this.getView().byId("hboxstartdateid").setVisible(false);
			}
			// JII 3786
			var filters = [];
			// Bind Items table
			var itemTable = sap.ui.core.Fragment.byId(this._frgIdItems, "tableItems");
			var orderSelected = this._sItemPath.split("'")[1];
			if (orderSelected && orderSelected.length > 0) {
				filters = [new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.Contains, orderSelected)];
				itemTable.getBinding("items").filter(filters);
			}
			// Bind Attachs uploads
			var attachsUpload = sap.ui.core.Fragment.byId(this._frgIdAttachments, "uploads");
			if (orderSelected && orderSelected.length > 0) {
				filters = [new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.Contains, orderSelected)];
				var curTplnr = this.getView().getModel().getProperty(this._sItemPath + "/Tplnr");
				filters.push(new sap.ui.model.Filter("Tplnr", sap.ui.model.FilterOperator.Contains, curTplnr));
				attachsUpload.getBinding("items").filter(filters);
			}
			// Bind Articles table
			var articleTable = sap.ui.core.Fragment.byId(this._frgIdArticles, "tableItems");
			if (orderSelected && orderSelected.length > 0) {
				filters = [new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.Contains, orderSelected)];
				articleTable.getBinding("items").filter(filters);
			}
			// Maintain visibility
			// if (this._oView.byId("txt_equipement").getText() === "") {
			// 	this._oView.byId("txt_equipement").setVisible(false);
			// 	this._oView.byId("lbl_equipement").setVisible(false);
			// } else {
			// 	this._oView.byId("txt_equipement").setVisible(true);
			// 	this._oView.byId("lbl_equipement").setVisible(true);
			// }
			var self = this;
			setTimeout(function() {
				// attendre le chargement des donn�es avant d'afficher les �lements choisis
				// Set WorkGroup and WorkType
				var curGroup = self.getView().getModel().getProperty(self._sItemPath + "/Urgrp");
				var curWorktype = self.getView().getModel().getProperty(self._sItemPath + "/Urcod");
				self._oView.byId("cb_workgroup").setSelectedKey(curGroup);
				self._oView.byId("cb_typeTravaux").setSelectedKey(curWorktype);
				self._oView.byId("cb_typeTravaux").setEnabled(true);
			}, 1000);

			// Get upload token
			this.getUploadToken();
		},
		onNavBack: function() {
			window.history.go(-1);
		},
		clearAll: function() {
			this._oView.byId("cb_intervenant").setSelectedKey();
			this._oView.byId("num_tempsTotalIntervention").setValue();
			this._oView.byId("num_tempsArret").setValue();
			this._oView.byId("cb_intervenant").setValueState("None");
			this._oView.byId("num_tempsTotalIntervention").setValueState("None");
			this._oView.byId("num_tempsArret").setValueState("None"); // this._oView.getModel().resetChanges();

			this._oView.byId("cb_workgroup").setSelectedKey();
			this._oView.byId("cb_workgroup").setValueState("None");
			this._oView.byId("cb_typeTravaux").setSelectedKey();
			this._oView.byId("cb_typeTravaux").setValueState("None");
			this._oView.byId("cb_pokayokes").setSelected(false);
			this._oView.byId("cb_safety").setSelected(false);
			this._oView.byId("cb_typeTravaux").setEnabled(false);

			var itemsData = sap.ui.core.Fragment.byId(this._frgIdItems, "tableItems").getItems();
			jQuery.each(itemsData, function(i, item) {
				var cells = item.getCells();
				for (var j = 0; j < 5; j++) {
					cells[8 + j].setSelected(false);
				}
				cells[1].setSelected(false);
				cells[2].setSelected(false);
			});

		},
		onQuitter: function(from) {
			if (from === "confirmed") {
				this.clearAll();
				this.onNavBack();
				return;
			}
			var self = this;
			//Confirmation dialog
			var dialog = new sap.m.Dialog({
				title: self._oResourceBundle.getText("titreMsgCancel"),
				type: "Message",
				content: new sap.m.Text({
					text: self._oResourceBundle.getText("confirmAnnulation")
				}),
				beginButton: new sap.m.Button({
					text: self._oResourceBundle.getText("btnOui"),
					press: function() {
						//Clear all + Close dialog + Nav back
						self.clearAll();
						dialog.close();
						// self.onNavBack();
						self._oRouter.navTo("main");
					}
				}),
				endButton: new sap.m.Button({
					text: self._oResourceBundle.getText("btnNon"),
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		onConfirmed: function() {
			var self = this;
			// V�rification des champs obligatoires
			var headerIntervenant = this._oView.byId("cb_intervenant");
			var headerTotalTime = this._oView.byId("num_tempsTotalIntervention");
			var headerStopTime = this._oView.byId("num_tempsArret");
			headerIntervenant.setValueState("None");
			headerTotalTime.setValueState("None");
			headerStopTime.setValueState("None");
			if (headerIntervenant.getSelectedKey() === "00000000" | headerIntervenant.getSelectedKey() === "") {
				headerIntervenant.setValueState("Error");
				return;
			}
			if (headerTotalTime.getValue() === "") {
				headerTotalTime.setValueState("Error");
				return;
			}
			var itemsCheck = sap.ui.core.Fragment.byId(this._frgIdItems, "tableItems").getItems();
			var confModified = false;
			// jQuery.each(itemsCheck, function(i, item) {
			// 	var cells = item.getCells();
			// 	var parconf = cells[1].getSelected();
			// 	var finconf = cells[2].getSelected();
			// 	if (parconf | finconf) {
			// 		confModified = true;
			// 		return true;
			// 	}
			// });
			itemsCheck.forEach(function(item) {
				var cells = item.getCells();
				var parconf = cells[1].getSelected();
				var finconf = cells[2].getSelected();
				if (parconf | finconf) {
					confModified = true;
					return true;
				}
			});
			if (!confModified) {
				sap.m.MessageBox.show(
					self._oResourceBundle.getText("confirmAtLeastOneOp"), {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: self._oResourceBundle.getText("titleConfirmAtLeastOneOp"),
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function() {}
					}
				);
				return;
			}
			if (headerStopTime.getValue() === "") {
				headerStopTime.setValueState("Error");
				return;
			}
			//Header
			var oHeader = {};
			oHeader.Aufnr = this._sItemPath.split("'")[1];
			oHeader.Description = this._oView.byId("txt_description").getValue();
			oHeader.Conftime = headerTotalTime.getValue();
			oHeader.Eauszt = headerStopTime.getValue();
			oHeader.Pernr = headerIntervenant.getSelectedKey();
			oHeader.Pokayokes = this._oView.byId("cb_pokayokes").getSelected() ? "X" : "";
			oHeader.Safety = this._oView.byId("cb_safety").getSelected() ? "X" : "";

			var selTypeTravaux = this._oView.byId("cb_typeTravaux");
			var selTypeTravauxCode;
			if (selTypeTravaux && selTypeTravaux.getSelectedItem()) {
				selTypeTravauxCode = selTypeTravaux.getSelectedItem().getKey();
			}
			var selWorkGroup = this._oView.byId("cb_workgroup");
			var selWorkGroupCode;
			if (selWorkGroup && selWorkGroup.getSelectedItem()) {
				selWorkGroupCode = selWorkGroup.getSelectedItem().getKey();
			}
			oHeader.Urgrp = selWorkGroupCode;
			oHeader.Urcod = selTypeTravauxCode;

			//Items
			var itemsData = sap.ui.core.Fragment.byId(this._frgIdItems, "tableItems").getItems();
			var items = [];
			jQuery.each(itemsData, function(i, item) {
				var cells = item.getCells();
				var status = "";
				for (var j = 0; j < 5; j++) {
					if (cells[8 + j].getSelected()) {
						status = j + 1;
						break;
					}
				}
				items.push({
					Vornr: cells[0].getText(),
					Parconf: cells[1].getSelected(),
					Finconf: cells[2].getSelected(),
					Pernr: cells[4].getText(),
					Comments: cells[6].getText(),
					Status: status.toString()
				});
			});
			oHeader.TOITEMS = items;
			//Call create_deep_entity of OData service
			var model = this._oView.getModel();
			this._oView.setBusy(true);
			model.create("/ORDERLISTSet", oHeader, null, function(oData, response) {
				self._oView.setBusy(false);
				if (oData.Error === "X") {
					sap.m.MessageBox.show(oData.Message, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: self._oResourceBundle.getText("titleOrderNumber") + " " + oData.Aufnr,
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function() {}
					});
				} else {
					sap.m.MessageBox.show(self._oResourceBundle.getText("msgOrdreConfirmed"), {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: self._oResourceBundle.getText("titleOrderNumber") + " " + oData.Aufnr,
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							self.onQuitter("confirmed");
						}
					});
				}
			}, function(oError) {
				self._oView.setBusy(false);
				sap.m.MessageBox.error(self._oResourceBundle.getText("msgEchecConfirmation") + oError);
			});
		},

		onItemSelect: function(oEvent) {

			//	if (!oEvent.getSource().data("definitive")) {
			if (!this._editItemDialog) {
				this._editItemDialog = sap.ui.xmlfragment(this._frgIdEditItemDialog, "PO_HISTORY.view.fragment.editItem", this);
				this._oView.addDependent(this._editItemDialog);
			}

			sap.ui.core.Fragment.byId(this._frgIdEditItemDialog, "addEditItemDialog").setModel(this.getView().getModel("orderitem"));
			//	sap.ui.core.Fragment.byId(this._frgIdEditItemDialog, "itemComments").setBindingContext(oEvent.getSource().getBindingContextPath());
			sap.ui.core.Fragment.byId(this._frgIdEditItemDialog, "itemComments").bindElement(oEvent.getSource().getBindingContextPath());

			//sap.ui.core.Fragment.byId(this._frgIdEditItemDialog, "cb_intervenant").setSelectedKey(oEvent.getSource().getCells()[4].getText());
			//			sap.ui.core.Fragment.byId(this._frgIdEditItemDialog, "itemCommentaire").setValue(oEvent.getSource().getCells()[6].getText());
			this._tmpVornr = oEvent.getSource().getCells()[0].getText();
			this._editItemDialog.invalidate();
			this._editItemDialog.open();
			//	}
		},
		closeDialog: function() {
			if (this._editItemDialog) {
				this._editItemDialog.close();
			}
			if (this._addArticleDialog) {
				this._addArticleDialog.close();
			}
			if (this._searchArticleDialog) {
				this._searchArticleDialog.close();
			}
		},
		closeSearchDialog: function() {
			// only closes the search dialog
			if (this._searchArticleDialog) {
				this._searchArticleDialog.close();
			}
		},
		saveItem: function() {
			var dialogIntervenantKey = sap.ui.core.Fragment.byId(this._frgIdEditItemDialog, "cb_intervenant").getSelectedKey();
			var dialogIntervenantName = sap.ui.core.Fragment.byId(this._frgIdEditItemDialog, "cb_intervenant").getSelectedItem().getText();
			var dialogCommentaire = sap.ui.core.Fragment.byId(this._frgIdEditItemDialog, "itemCommentaire").getValue();
			var itemsData = sap.ui.core.Fragment.byId(this._frgIdItems, "tableItems").getItems();
			for (var i = 0; i < itemsData.length; i++) {
				if (itemsData[i].getCells()[0].getText() === this._tmpVornr) {
					itemsData[i].getCells()[3].setText(dialogIntervenantName);
					//Intervenant
					itemsData[i].getCells()[4].setText(dialogIntervenantKey);
					//IntervenantId
					itemsData[i].getCells()[6].setText(dialogCommentaire);
					//Commentaire
					break;
				}
			}
			this._tmpVornr = null;
			this.closeDialog();
		},

		intervenantSelected: function(oEvent) {
			if (oEvent.getSource().getSelectedKey !== "00000000") {
				oEvent.getSource().setValueState("None");
			}
		},
		inputChanged: function(oEvent) {
			if (oEvent.getSource().getValue() !== "") {
				oEvent.getSource().setValueState("None");
			}
		},
		//Formatter
		reverseBoolean: function(flag, subitem) {
			if (subitem) {
				return false;
			} else {
				return !flag;
			}
		},
		formatBase64: function(attach) {
			// return attach.replace(/AAAA/g,"");
			return attach;
		},
		removeLeadingZeros: function(value) {
			return Number(value);
		},
		/**
		 *@memberOf PO_HISTORY.controller.Details
		 */
		onItbSelect: function(oEvent) {
			var sKey = oEvent.getParameter("key");
			if (sKey === "stock") {
				this.getView().byId("btnStock").setVisible(true);
			} else {
				this.getView().byId("btnStock").setVisible(false);
			}
		},
		onStock: function() {
			if (!this._addArticleDialog) {
				this._addArticleDialog = sap.ui.xmlfragment(this._frgIdAddArticleDialog, "PO_HISTORY.view.fragment.addArticle", this);
				this._oView.addDependent(this._addArticleDialog);
			}

			if (!this._oComponent.getModel("stock")) {
				this._oComponent.setModel(new sap.ui.model.json.JSONModel({
					"date": new Date()
				}), "stock");
			}
			this._addArticleDialog.setModel(this._oComponent.getModel("stock"), "stock");

			this._addArticleDialog.open();
		},
		searchArticle: function() {
			if (!this._searchArticleDialog) {
				this._searchArticleDialog = sap.ui.xmlfragment(this._frgIdSearchArticleDialog, "PO_HISTORY.view.fragment.searchArticle", this);
				this._oView.addDependent(this._searchArticleDialog);
			}
			this._searchArticleDialog.open();
		},
		onScanArticle: function() {
			var self = this;
			cordova.plugins.barcodeScanner.scan(
				function(result) {
					var matnr = result.text;
					var pattern = new RegExp("^[A-Za-z0-9]{1,18}$");
					if (!pattern.test(matnr)) {
						sap.m.MessageToast.show(this._oResourceBundle.getText("msgErreurNumArticle"));
						return;
					}
					self.getView().getModel().read("/GOODS_ISSUESet(Aufnr='',Matnr='" + matnr + "')", null, null, true, function(oData) {
						if (oData.Maktx === "") {
							sap.m.MessageBox.show(
								this._oResourceBundle.getText("msgArticleNotFound"), {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: this._oResourceBundle.getText("msgErreur"),
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function() {}
								});
						} else {

							sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "articleDesc").setText(oData.Maktx);
							sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "inputQty").setPlaceholder(oData.Quantity + " " + oData.Meins + " " +
								this._oRessourceBundle.getText("placeHolderQty"));
							sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "qtyUnit").setText(oData.Meins);
						}
						sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "inputArticle").setValue(matnr);
					}, function() {
						console.log(this._oResourceBundle.getText("consoleReadFail"));
					});
				},
				function(error) {
					alert(this._oResourceBundle.getText("alertScan") + error);
				}
			);
		},
		onSearchArticle: function(oEvent) {
			var self = this;
			var matnr = oEvent.getSource().getValue();
			var pattern = new RegExp("^[A-Za-z0-9]{1,18}$");
			if (!pattern.test(matnr)) {
				sap.m.MessageToast.show(this._oResourceBundle.getText("messageNotValidArticle"));
				return;
			}
			this.getView().getModel().read("/GOODS_ISSUESet(Aufnr='',Matnr='" + matnr + "')", null, null, true, function(oData) {
				if (oData.Maktx === "") {
					sap.m.MessageBox.show(
						this._oResourceBundle.getText("msgArticleNotFound"), {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: this._oResourceBundle.getText("msgErreur"),
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function() {}
						}
					);
				} else {
					sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "articleDesc").setText(oData.Maktx);
					sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "inputQty").setPlaceholder(oData.Quantity + " " + oData.Meins + " " +
						self._oResourceBundle
						.getText("en stock"));
					sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "qtyUnit").setText(oData.Meins);
				}
				sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "inputArticle").setValue(matnr);
			}, function() {
				console.log(this._oResourceBundle.getText("consoleReadFail"));
			});
		},
		saveArticle: function() {
			var self = this;
			var oElement = {};
			oElement.Aufnr = this._sItemPath.split("'")[1];
			oElement.Matnr = sap.ui.core.Fragment.byId(this._frgIdAddArticleDialog, "inputArticle").getValue();
			oElement.Quantity = parseInt(sap.ui.core.Fragment.byId(this._frgIdAddArticleDialog, "inputQty").getValue());
			oElement.Budat = this._oComponent.getModel("stock").getProperty("/date");
			this.getView().getModel().create("/GOODS_ISSUESet", oElement, null, function(oData) {
				sap.m.MessageBox.show(
					oData.Message, {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: self._oResourceBundle.getText("messageBoxTitleResult"),
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function() {}
					}
				);
				self._addArticleDialog.close();
				sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "inputArticle").setValue();
				sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "articleDesc").setText();
				sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "inputQty").setPlaceholder();
				sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "qtyUnit").setText();
				sap.ui.core.Fragment.byId(self._frgIdAddArticleDialog, "inputQty").setValue();
				this._oComponent.getModel("stock").setProperty("/date", new Date());
			}, function(oError) {

			});
		},

		onUploadComplete: function() {
			this.getView().getModel().refresh(true);
		},

		onBeforeUploadStarts: function() {},
		onChange: function(oEvent) {
			// Header Token
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: this._token //"securityTokenFromModel"
			});
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameters().files[0].name
			});
			oEvent.getSource().addHeaderParameter(oCustomerHeaderToken);
			oEvent.getSource().addHeaderParameter(oCustomerHeaderSlug);
		},

		onFileDeleted: function(oEvent) {
			var sDocumentId = oEvent.getParameter("documentId");
			var model = this.getView().getModel();
			model.remove("/ATTACHSet(Tplnr='',Equnr='',Dktxt='" + sDocumentId + "')", null, null, function() {});
			this.getView().getModel().refresh(true);
			// oEvent.getSource().rerender();
		},
		getUploadToken: function(callback) {
			var self = this;
			OData.request({
					requestUri: window.location.origin + "/sap/opu/odata/sap/ZPM_CONFIRM_ORDER_SRV/ORDERLISTSet",
					method: "GET",
					headers: {
						"X-Requested-With": "XMLHttpsRequest",
						"Content-Type": "application/xml;charset=utf-8",
						"DataServiceVersion": "2.0",
						"X-CSRF-Token": "Fetch"
					}
				},
				function(data, response) {
					callback(response.headers["x-csrf-token"]);
				}
			);

			function callback(token) {
				self._token = token;
			}
		},
		handleWorkTypeChange: function(oEvent) {
			/*alert("El�ment choisi: '" + oEvent.getParameter("selectedItem").getText() + "'");*/
			this.getView().byId("cb_group").setEnabled(true);
		},
		resetSearch: function() {
			var filters = [];
			sap.ui.core.Fragment.byId(this._frgIdSearchArticleDialog, "table").getBinding("items").filter(filters);
			sap.ui.core.Fragment.byId(this._frgIdSearchArticleDialog, "material").setValue("");
			sap.ui.core.Fragment.byId(this._frgIdSearchArticleDialog, "materialDesc").setValue("");
			sap.ui.core.Fragment.byId(this._frgIdSearchArticleDialog, "manfPart").setValue("");
			sap.ui.core.Fragment.byId(this._frgIdSearchArticleDialog, "manf").setValue("");
			sap.ui.core.Fragment.byId(this._frgIdSearchArticleDialog, "oldPartNum").setValue("");
		},
		performSearch: function() {
			// Filter table by user input
			var codeArticle = sap.ui.core.Fragment.byId(this._frgIdSearchArticleDialog, "material");
			var descArticle = sap.ui.core.Fragment.byId(this._frgIdSearchArticleDialog, "materialDesc");
			var manfPartN = sap.ui.core.Fragment.byId(this._frgIdSearchArticleDialog, "manfPart");
			var manfRef = sap.ui.core.Fragment.byId(this._frgIdSearchArticleDialog, "manf");
			var oldPartNum = sap.ui.core.Fragment.byId(this._frgIdSearchArticleDialog, "oldPartNum");
			var filters = [];
			if (codeArticle.getValue() !== "") {
				filters.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, codeArticle.getValue()));
			}
			if (descArticle.getValue() !== "") {
				filters.push(new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.EQ, descArticle.getValue()));
			}
			if (manfPartN.getValue() !== "") {
				filters.push(new sap.ui.model.Filter("ZMfrpn", sap.ui.model.FilterOperator.EQ, manfPartN.getValue()));
			}
			if (manfRef.getValue() !== "") {
				filters.push(new sap.ui.model.Filter("ZMfrnr", sap.ui.model.FilterOperator.EQ, manfRef.getValue()));
			}
			if (oldPartNum.getValue() !== "") {
				filters.push(new sap.ui.model.Filter("ZzOldMatnr", sap.ui.model.FilterOperator.EQ, oldPartNum.getValue()));
			}
			sap.ui.core.Fragment.byId(this._frgIdSearchArticleDialog, "table").getBinding("items").filter(filters);
		},
		onPress: function(oEvent) {
			var codeArticle = oEvent.getSource().getBindingContext().getPath().substr(14).replace("')", "");
			sap.ui.core.Fragment.byId(this._frgIdAddArticleDialog, "inputArticle").setValue(codeArticle);
			sap.ui.core.Fragment.byId(this._frgIdAddArticleDialog, "inputArticle").fireChange();
			this.closeSearchDialog();
		},
		handleWorkGroupChange: function(oEvent) {
			this.getView().byId("cb_typeTravaux").setEnabled(true);
			this.getView().byId("cb_typeTravaux").setSelectedItem(null);
			var selectedKey = oEvent.getParameter("selectedItem").getKey();
			var filters = [];
			filters.push(new sap.ui.model.Filter("Codegruppe", sap.ui.model.FilterOperator.EQ, selectedKey));
			this.getView().byId("cb_typeTravaux").getBinding("items").filter(filters);
		},

		formatItem: function(item, subitem) {
			var text = (item / 1);
			if (subitem) {
				text += " " + subitem;
			}
			// return (item / 1);
			return text;
		},

		convertDate: function(date, time) {
			var recordedDate, recordedTime;
			if (date !== null) {
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({});
				recordedDate = dateFormat.format(date);
			}
			if (time !== null) {

				var seconds = time.ms / 1000;
				var hours = parseInt(seconds / 3600);
				seconds = seconds % 3600;
				var minutes = parseInt(seconds / 60);
				seconds = seconds % 60;

				hours = ("00" + hours).slice(-2);
				minutes = ("00" + minutes).slice(-2);
				seconds = ("00" + seconds).slice(-2);
				recordedTime = hours + ":" + minutes + ":" + seconds;

			}

			return recordedDate + " " + recordedTime;
		},

		finalhours: function(flag, hours) {
			if (flag === 'X') {
				return this._oResourceBundle.getText("Final") + " " + hours + " (MIN)";
			} else {
				return this._oResourceBundle.getText("Partial") + " " + hours + " (MIN)";
			}
		},
		// Format the item comments, in case comments is empty then show standard text
		onFormatItemComments: function(comments, time) {
			if (time !== '0.0') {
				return this._oResourceBundle.getText("emptyComments");
			} else {
				return "";
			}
		}
	});
});
