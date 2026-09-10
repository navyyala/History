sap.ui.define([
	"sap/ndc/BarcodeScanner",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/HBox",
	"sap/m/Button"
], function(BarcodeScanner, MessageToast, MessageBox, Dialog, Input, Text, HBox, Button) {
	return {
		onDeleteStockOutput: function(oEvent) {
			var selectedPath = oEvent.getSource().getParent().getBindingContextPath();
			this.selectedData = this.getView().getModel().getProperty(selectedPath);
			if (!this._stockOutputDeleteConfDialog) {
				var oInput = new Input({
					type: "Number",
					change: this.stockOutputHelper.quantityCheck.bind(this)
				});
				this._stockOutputDeleteConfDialog = new Dialog({
					title: this._oResourceBundle.getText("textBtnConfirmed"),
					content: [
						new HBox({
							width: "100%",
							items: [
								new Text({
									text: this._oResourceBundle.getText("stockConfirmMsg")
								}).addStyleClass("sapUiTinyMargin"),
								oInput
							]
						}).addStyleClass("sapUiMediumMargin")
					],

					beginButton: new Button({
						text: this._oResourceBundle.getText("textBtnDelete"),
						type: sap.m.ButtonType.Reject,
						press: function(oEvent) {
							var quantity = oEvent.getSource().getParent().getContent()[0].getItems()[1].getValue();
							var entryToBeDeleted = "/GOODS_ISSUESet(Aufnr='" + this.selectedData.Aufnr + "',Matnr='" + this.selectedData.Matnr +
								"',Quantity=" +
								quantity + ",Lgort='" + this.selectedData.Lgort + "')";
							this.getView().getModel("orderitem").remove(entryToBeDeleted, {
								success: function() {
									MessageToast.show(this._oResourceBundle.getText("successMessage"));
									this.getView().getModel().refresh();
									this.selectedData = null;
									this._stockOutputDeleteConfDialog.close();
								}.bind(this),
								error: function(oError) {
									MessageBox.error(JSON.parse(oError.responseText).error.message.value);
									this.selectedData = null;
								}
							});

						}.bind(this)
					}),
					endButton: new Button({
						text: this._oResourceBundle.getText("textBtnCancel"),
						type: sap.m.ButtonType.Transparent,
						press: function(event) {
							this.selectedData = null;
							event.getSource().getParent().getContent()[0].getItems()[1].setValueState("None");
							this._stockOutputDeleteConfDialog.getBeginButton().setEnabled(true);
							this._stockOutputDeleteConfDialog.close();
						}.bind(this)

					})
				});
				this._stockOutputDeleteConfDialog.getContent()[0].getItems()[1].setValue(this.selectedData.Quantity);
				this._stockOutputDeleteConfDialog.open();
			} else {
				this._stockOutputDeleteConfDialog.getContent()[0].getItems()[1].setValue(this.selectedData.Quantity);
				this._stockOutputDeleteConfDialog.open();
			}
		},

		quantityCheck: function(oEvent) {
			var enteredValue;
			if (oEvent.getSource().getValue()) {
				enteredValue = oEvent.getSource().getValue();
				if (enteredValue > this.selectedData.Quantity || enteredValue <= 0) {
					oEvent.getSource().setValueState("Error");
					oEvent.getSource().setValueStateText(this._oComponent.getModel("i18n").getResourceBundle().getText("quantityError"));
					this._stockOutputDeleteConfDialog.getBeginButton().setEnabled(false);
				} else {
					oEvent.getSource().setValueState("None");
					oEvent.getSource().setValueStateText("");
					this._stockOutputDeleteConfDialog.getBeginButton().setEnabled(true);
				}
			}
		}
	};
});