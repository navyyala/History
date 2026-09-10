sap.ui.define([
	"sap/ui/Device"
], function (Device) {
	"use strict";

	var messages = {};

	/**
	 * Show an error dialog with information from the oData response object.
	 *
	 * @param {object}
	 *            oParameter The object containing error information
	 * @return {void}
	 * @public
	 */
	messages.showErrorMessage = function (oParameter) {
		var oErrorDetails = messages._parseError(oParameter);
		var oMsgBox = sap.ca.ui.message.showMessageBox({
			type: sap.ca.ui.message.Type.ERROR,
			message: oErrorDetails.sMessage,
			details: oErrorDetails.sDetails
		});
		if (!Device.support.touch) {
			oMsgBox.addStyleClass("sapUiSizeCompact");
		}
	};

	messages.getErrorContent = function (oParameter) {
		return messages._parseError(oParameter).sMessage;
	};

	messages._parseError = function (oParameter) {
		var sMessage = "",
			sDetails = "",
			oEvent = null,
			oResponse = null,
			oError = {};

		if (oParameter.mParameters) {
			oEvent = oParameter;
			sMessage = oEvent.getParameter("message");
			sDetails = oEvent.getParameter("responseText");
		} else {
			oResponse = oParameter;
			sMessage = oResponse.message;
			sDetails = oResponse.response.body;
		}

		if (typeof sDetails === "string" && sDetails.indexOf("{\"error\":") === 0) {
			var oErrModel = new sap.ui.model.json.JSONModel();
			oErrModel.setJSON(sDetails);
			sMessage = oErrModel.getProperty("/error/message/value");
		}

		oError.sDetails = sDetails;
		oError.sMessage = sMessage;
		return oError;
	};

	return messages;
});
