sap.ui.define([
	"sap/ui/base/Object"
], function(UI5Object) {
	"use strict";
	var instance;
	var fsHandler = UI5Object.extend("PO_HISTORY.util.exportService", {
		appStorage: null,
		constructor: function() {
			this.logger = jQuery.sap.log.getLogger();
			console.log("constructor of FileSystemHandler ");
			try {
				if (cordova.platformId == 'ios') {
					/** FLA ITUNES 12.7 (ios11 related) */
					this.appStorage = cordova.file.documentsDirectory; ///ios cordova.file.dataDirectory; 
				} else if (cordova.platformId == 'android') {
					this.appStorage = cordova.file.externalApplicationStorageDirectory; //android
				} else {
					this.appStorage = cordova.file.dataDirectory; //windows UAP ? 8 ? 
				}
			} catch (error) {
				console.log("no FS access");
			}

		},

		writeFileContent: function(fileName, directoryName, oContent, callback, errorcb) {
			var me = this;
			if (typeof(cordova) == "undefined") {
				console.log(" *** NO FS ACCESS  *** ");
				errorcb("no FS access");
				return;
			}
			me.openFile(fileName, directoryName, true, function(fileEntry) {
				me.writeFile(fileEntry, oContent, callback, errorcb);
			}, function(error) {
				console.log("onErrorReadFile", error);
			}, errorcb);
		},
		readFileContent: function(fileName, directoryName, callback, errorcb) {
			if (typeof(cordova) == "undefined") {
				errorcb("non cordova context, FS not available");
				return;
			}
			this.openFile(fileName, directoryName, false, function(fileEntry) {
				fileEntry.file(function(file) {
					var reader = new FileReader();
					reader.onloadend = function() {
						console.log("Successful file read: ", this.result);
						callback(this.result);
					};
					reader.readAsText(file);
				}, function(error) {
					console.log("onErrorReadFile", error);
					errorcb(error);
				});
			}, errorcb);
		},

		openFile: function(fileName, directoryName, create, callback, errorcb) {
			var me = this;

			window.resolveLocalFileSystemURL(me.appStorage, function(rootDirEntry) {
				console.log('file system open: ' + rootDirEntry.name);
				rootDirEntry.getDirectory(directoryName, {
					create: true
				}, function(dirEntry) {
					me.getFile(dirEntry, fileName, create, callback, errorcb);
				}, errorcb);
			}, errorcb);
		},

		createDirectory: function(rootDirEntry) {
			var me = this;
			rootDirEntry.getDirectory('NewDirInRoot', {
				create: true
			}, function(dirEntry) {
				dirEntry.getDirectory('images', {
					create: true
				}, function(subDirEntry) {

					me.createFile(subDirEntry, "fileInNewSubDir.txt");

				}, function(error) {
					console.log("onErrorGetDir", error);
				});
			}, function(error) {
				console.log("onErrorGetDir", error);
			});
		},

		createFile: function(dirEntry, fileName, isAppend) {
			var me = this;
			// Creates a new file or returns the file if it already exists.
			dirEntry.getFile(fileName, {
				create: true,
				exclusive: false
			}, function(fileEntry) {

				me.writeFile(fileEntry, null, isAppend);

			}, function(error) {
				console.log("onErrorCreateFile", error);
			});

		},

		getFile: function(dirEntry, fileName, create, callback, errorcb) {
			var me = this;
			// Creates a new file or returns the file if it already exists.
			dirEntry.getFile(fileName, {
				create: create,
				exclusive: false
			}, callback, errorcb);

		},

		writeFile: function(fileEntry, dataObj, callback, errorcb) {
			var me = this;
			// Create a FileWriter object for our FileEntry (log.txt).
			fileEntry.createWriter(function(fileWriter) {

				fileWriter.onwriteend = function() {
					console.log("Successful file write...");
					callback(fileEntry);
				};

				fileWriter.onerror = function(e) {
					console.log("Failed file write: " + e.toString());
					errorcb(e);
				};

				// If data object is not passed in,
				// create a new Blob instead.
				//TODO : iOS not working : change to use Blob
				if (!dataObj) {
					dataObj = new Blob(['some file data'], {
						type: 'text/csv'
					});
				}

				fileWriter.write(dataObj);
			});
		},

		readFile: function(fileEntry) {

			fileEntry.file(function(file) {
				var reader = new FileReader();

				reader.onloadend = function() {
					console.log("Successful file read: ", this.result);
					// displayFileData(fileEntry.fullPath + ": " + this.result);
				};

				reader.readAsText(file);

			}, function(error) {
				console.log("onErrorReadFile", error);
			});
		}

	});
	instance = new fsHandler();
	return instance;
});
