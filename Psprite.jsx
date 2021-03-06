﻿/*==============================================================================
 CSS Spriteの作成
 
 @version 0.1,  3 AUG 2014
 @author @kumak1
==============================================================================*/
#target photoshop
(function() {

    // 定数の宣言
    const def = {
        // ファイル
        fileHtm: "/index.html",
        fileCss: "/style.css",
        fileImg: "/sprite.png",

        // ダイアログのタイトル表示
        titleDialog: "Psprite",
        titleOutput: "Output",
        titleOption: "Option",

        // ダイアログのラベル表示
        lblHtm: "　index.html を作成する。",
        lblCss: "　style.css を作成する。",
        lblImg: "　sprite.png を作成する。",
        lblSet: "　グループ毎に作成する。",

        // ダイアログのボタン表示
        btnChoseDir: "...",
        btnCancel: "キャンセル",
        btnOutput: "出力",

        // ダイアログのメッセージ表示
        msgMustOpenFiles: "ファイルを開いてから実行して下さい。",
        msgChoseDir: "出力フォルダを選択して下さい。",
        msgFileOutputFalse: "ファイルを正しく出力できませんでした。",
        msgFin: "ファイルを出力しました。"
    };

    // 自動実行
    (function() {
        // ファイルを開いているかチェック
        if (documents.length == 0) {
            alert(def.msgMustOpenFiles);
            return;
        }

        //ダイアログ表示
        var dialog = OpenDialog();

        // 「出力先選択」ボタンのイベント
        dialog.btnPath.onClick = function() {
            dialog.lblPath.text = Folder.selectDialog("Select");
        }

        // 「キャンセル」ボタンのイベント
        dialog.btnCancel.onClick = function() {
            dialog.close();
        }

        // 「出力」ボタンのイベント
        dialog.btnOutput.onClick = function() {
            //処理時間計測用
            var actionTime = new Date().getTime();
            
            //出力するディレクトリが指定されていない場合、処理を抜ける
            if (dialog.lblPath.text == def.msgChoseDir) {
                alert(def.msgChoseDir);
                return;
            }

            //出力チェック
            var hasHtm = dialog.chkMakeHTM.value;
            var hasCss = dialog.chkMakeCSS.value;
            var hasImg = dialog.chkMakeIMG.value;
            var hasSet = dialog.chkMakeSet.value;

            //レイヤー情報の取得
            var layerInfo = hasSet? GetSetInfo(activeDocument) : GetLayerInfo(activeDocument);

            //HTML生成
            if (hasHtm) {
                FileOutput(dialog.lblPath.text + def.fileHtm, GenerateHTML(layerInfo));
            }
            //CSS生成
            if (hasCss) {
                FileOutput(dialog.lblPath.text + def.fileCss, GenerateCSS(layerInfo));
            }
            //PNG生成
            if (hasImg) {
                ImageOutput(dialog.lblPath.text + def.fileImg);
            }
            alert(def.msgFin + "\r\n処理時間 : " + (new Date().getTime() - actionTime) + "ms.");
        }
        dialog.show();
    })();

    //ダイアログ表示
    function OpenDialog() {
        const DIALOG = "dialog";
        const PANEL = "panel";
        const TEXT = "statictext";
        const BUTTON = "button";
        const CHECK = "checkbox";
        const common = CommonDialog();

        //ウィンドウ生成
        win = new Window(DIALOG, def.titleDialog);
        win.bounds = common.getBoundsDialog();
        win.center();

        // 「Output」パネルの表示
        pnlPath = win.add(PANEL, common.getBoundsOutputPanel(), def.titleOutput);
        pnlPathInner = common.getBoundsPanel(pnlPath);
        win.lblPath = win.add(TEXT, pnlPathInner.get(), def.msgChoseDir);
        win.btnPath = win.add(BUTTON, common.getBoundsOutputButton(win.lblPath), def.btnChoseDir);
        pnlPath.bounds[3] = pnlPathInner.get()[3] - 10;

        //「Option」パネルの表示
        pnlOption = win.add(PANEL, common.getBoundsOptionPanel(pnlPath), def.titleOption);
        pnlOptionInner = common.getBoundsPanel(pnlOption);
        win.chkMakeHTM = win.add(CHECK, pnlOptionInner.get(), def.lblHtm);
        win.chkMakeCSS = win.add(CHECK, pnlOptionInner.get(), def.lblCss);
        win.chkMakeIMG = win.add(CHECK, pnlOptionInner.get(), def.lblImg);
        win.chkMakeSet = win.add(CHECK, pnlOptionInner.get(), def.lblSet);
        pnlOption.bounds[3] = pnlOptionInner.get()[3] - 10;

        win.chkMakeHTM.value = true;
        win.chkMakeCSS.value = true;
        win.chkMakeIMG.value = true;

        //「出力/キャンセル」ボタンの表示
        btnAreaInner = common.getBoundsButton();
        win.btnCancel = win.add(BUTTON, btnAreaInner.get(), def.btnCancel);
        win.btnOutput = win.add(BUTTON, btnAreaInner.get(), def.btnOutput);

        return win;
    }

    //ダイアログ表示用
    function CommonDialog() {
        const _OFFSET_X_MIN_ = 10;
        const _OFFSET_Y_MIN_ = 10;
        const _WINDOW_WIDTH_ = 400;
        const _WINDOW_HEIGHT_ = 350;
        const _PANEL_PADDING_INNER_ = 28;
        const _PANEL_MARGIN_ = 20;
        const _PANEL_LINEHEIGHT_ = 18;
        const _BUTTON_WIDTH_ = 80;
        const _BUTTON_HEIGHT_ = 30;
        const _OFFSET_X_ = _WINDOW_WIDTH_ - _OFFSET_X_MIN_;
        const _OFFSET_X_CALC_ = _BUTTON_WIDTH_ + _OFFSET_X_MIN_;
        const _OFFSET_Y_ = _WINDOW_HEIGHT_ - _BUTTON_HEIGHT_ - _PANEL_MARGIN_;

        //位置情報を取得
        var GetBounds =
            function(offsetX, offsetY, width, height) {
                return [offsetX, offsetY, offsetX + width, offsetY + height]
            };
        //対象オブジェクトの幅を取得
        var GetObjWidth =
            function(obj) {
                return obj.bounds[2] - obj.bounds[0];
            };
        //ウインドウ幅に合わせた位置情報を取得
        var GetBoundsFixed =
            function(offsetY, height) {
                return GetBounds(_OFFSET_X_MIN_, offsetY, _WINDOW_WIDTH_ - (_OFFSET_X_MIN_ * 2), height);
            };
        //対象オブジェクト左上から、+X軸+Y軸 移動した位置情報を取得
        var GetBoundsL =
            function(obj, absoluteX, absoluteY, width, height) {
                return GetBounds(obj.bounds[0] + absoluteX, obj.bounds[1] + absoluteY, width, height);
            };
        //対象オブジェクト右上から、-X軸+Y軸 移動した位置情報を取得
        var GetBoundsR =
            function(obj, absoluteX, absoluteY, width, height) {
                return GetBounds(obj.bounds[2] - absoluteX - width, obj.bounds[1] + absoluteY, width, height);
            };
        //Dialogの位置情報を取得
        var GetBoundsDialog =
            function() {
                return GetBounds(0, 0, _WINDOW_WIDTH_, _WINDOW_HEIGHT_);
            };
        //Outputのパネルの位置情報を取得
        var GetBoundsOutputPanel =
            function() {
                return GetBoundsFixed(_OFFSET_Y_MIN_, 0);
            };
        //Outputのボタンの位置情報を取得
        var GetBoundsOutputButton =
            function(obj) {
                return GetBoundsR(obj, 0, 0, 18, 18);
            };
        //Optionのパネルの位置情報を取得
        var GetBoundsOptionPanel =
            function(obj) {
                return GetBoundsFixed(obj.bounds[3] + _PANEL_MARGIN_, 0);
            };
        //ボタン用の位置情報を取得
        var GetBoundsButton =
            function() {
                var cnt = 0;
                return {
                    get: function() {
                        cnt++;
                        return GetBounds(_OFFSET_X_ - (_OFFSET_X_CALC_ * cnt), _OFFSET_Y_, _BUTTON_WIDTH_, _BUTTON_HEIGHT_);
                    }
                }
            };
        //対象パネル内の位置情報を行インクリメント取得
        var GetBoundsPanel =
            function(obj) {
                var cnt = 0;
                return {
                    get: function() {
                        cnt++;
                        return GetBoundsL(obj, _PANEL_PADDING_INNER_, _PANEL_PADDING_INNER_ * cnt, GetObjWidth(obj) - 15 - _PANEL_PADDING_INNER_, _PANEL_LINEHEIGHT_);
                    }
                }
            };
        
        var result = new Object;
        result.getBounds = GetBounds;
        result.getObjWidth = GetObjWidth;
        result.getBoundsFixed = GetBoundsFixed;
        result.getBoundsL = GetBoundsL;
        result.getBoundsR = GetBoundsR;
        result.getBoundsDialog = GetBoundsDialog;
        result.getBoundsOutputPanel = GetBoundsOutputPanel;
        result.getBoundsOutputButton = GetBoundsOutputButton;
        result.getBoundsOptionPanel = GetBoundsOptionPanel;
        result.getBoundsButton = GetBoundsButton;
        result.getBoundsPanel = GetBoundsPanel;
        
        return result;
    }

    //レイヤー情報の取得
    function GetLayerInfo(doc) {
        var results = new Array;

        var AddLayer = function AddLayer(arg) {
            //関数をキャッシュ
            var layerInfo = LayerInfo;
            
            for (var key in arg) {
                switch (key) {
                    case "artLayers":
                        var layer = arg[key];
                        for (var i = 0, len = layer.length; i < len; i++) {
                            var target = layer[i];
                            if (target.visible){
                                results[results.length] = layerInfo(target);
                            }
                        }
                        break;
                    case "layerSets":
                        var layer = arg[key];
                        for (var i = 0, len = layer.length; i < len; i++) {
                            AddLayer(layer[i]);
                        }
                        break;
                    default:
                        break;
                }
            }
        }(doc);

        return results;
    }

    //レイヤー情報の取得
    function GetSetInfo(doc) {
        var results = new Array;
        
        //関数をキャッシュ
        var layerInfo = LayerInfo;
        var getLayerInfo = GetLayerInfo;
        var getMaxBounds = GetMaxBounds;

        var artLayer = doc["artLayers"];
        for (var i = 0, len = artLayer.length; i < len; i++) {
            var target = artLayer[i];
            if (target.visible){
                results[results.length] = layerInfo(target);
            }
        }

        var layerSet = doc["layerSets"];
        for (var i = 0, len = layerSet.length; i < len; i++) {
            var group = layerSet[i];
            var layer = getLayerInfo(group);
            var obj = new Object;
            obj.name = group.name;
            obj.bounds = getMaxBounds(layer);
            results[results.length] = layerInfo(obj);
        }

        return results;
    }

    // レイヤー群から最大となる位置情報を取得
    function GetMaxBounds (obj) {
        var b0 = new Array;
        var b1 = new Array;
        var b2 = new Array;
        var b3 = new Array;

        for (var i = 0, len = obj.length; i < len ; i++) {
            var layer = obj[i];
            b0[i] = layer.bounds[0];
            b1[i] = layer.bounds[1];
            b2[i] = layer.bounds[2];
            b3[i] = layer.bounds[3];
        }
    
        var result = new Array;
        result[0] = Math.min.apply(null, b0);
        result[1] = Math.min.apply(null, b1);
        result[2] = Math.max.apply(null, b2);
        result[3] = Math.max.apply(null, b3);
        
        return result;
    }

    // レイヤー情報インスタンス生成
    function LayerInfo(obj) {
        var result = new Object;
        
        //レイヤー名
        result.name = obj.name.replace(" ", "_");
        //レイヤー位置
        result.offsetX = 0 + obj.bounds[0]; //X軸
        result.offsetY = 0 + obj.bounds[1]; //Y軸
        //レイヤー幅
        result.width = 0 + obj.bounds[2] - result.offsetX; //X軸
        result.height = 0 + obj.bounds[3] - result.offsetY; //Y軸
        result.bounds = obj.bounds;
        
        return result;
    }

    //HTML生成
    function GenerateHTML(layerInfo) {
        const cr = "\r\n";
        
        var html = "";
        html += cr + '<!DOCTYPE html>';
        html += cr + '<html lang="ja">';
        html += cr + '<head>';
        html += cr + '<title>Psprite</title>';
        html += cr + '<meta charset="shift_jis">';
        html += cr + '<meta name="viewport" content="width=device-width, initial-scale=1">';
        html += cr + '<link rel="stylesheet" href=".' + def.fileCss + '">';
        html += cr + '<link rel="stylesheet" href="http://yui.yahooapis.com/pure/0.5.0/pure-min.css">';
        html += cr + '<link rel="stylesheet" href="http://yui.yahooapis.com/pure/0.5.0/grids-responsive.css">';
        html += cr + '<style>';
        html += cr + 'body {color:#777;}';
        html += cr + '.header {background: none repeat scroll 0 0 #fff;border-bottom: 1px solid #eee;margin: 0 auto;max-width: 768px;padding: 1em;text-align: center;}';
        html += cr + '.header h1 {font-family:"omnes-pro";font-size: 3em;font-weight: 100;margin: 0;color: rgb(75, 75, 75);}';
        html += cr + '.header h2 {color: #666;font-size: 1.2em;font-weight: 100;line-height: 1.5;margin: 0;}';
        html += cr + '.content {margin-left: auto;margin-right: auto;max-width: 768px;padding-left: 2em;padding-right: 2em;}';
        html += cr + '.content h3 {color: #555;font-size: 1em;font-weight: 100;line-height: 1.5;margin:4em 0 0;}';
        html += cr + '.footer {background: none repeat scroll 0 0 rgb(250, 250, 250);border-top: 1px solid #eee;font-size: 87.5%;margin-top: 3.4em;padding: 1.1em;}';
        html += cr + '.legal-license {margin: 0;text-align: left;}';
        html += cr + '.legal-copyright, .legal-links, .legal-links li {margin: 0;text-align: right;}';
        html += cr + '.legal-links {list-style: none outside none;margin-bottom: 0;padding: 0;}';
        html += cr + 'pre, code {background: none repeat scroll 0 0 rgb(250, 250, 250);color: #333;font-family: Ricty,Consolas,"Liberation Mono",Courier,monospace;font-size: 1em;}';
        html += cr + 'pre {white-space: pre-wrap;word-wrap: break-word; padding:1.6em;border:1px #ddd solid}';
        html += cr + '</style>';        
        html += cr + '</head>';
        html += cr + '<body>';

        html += cr + '<div class="header">';
        html += cr + '  <h1>Psprite</h1>';
        html += cr + '  <h2>Quickstart your next web project with these example css.</h2>';
        html += cr + '</div>';

        html += cr + '<div class="content">';
        
        for (var i = 0, len = layerInfo.length; i < len; i++) {
            var layer = layerInfo[i];
            html += cr + '  <h3>' + layer.name + '</h3>';
            html += cr + '<pre><code>{';
            html += cr + '  background-image: url("sprite.png");';
            html += cr + '  background-repeat: no-repeat;';
            html += cr + '  display: block;';
            html += cr + '  overflow: hidden;';
            html += cr + '  text-indent: 100%;';
            html += cr + '  white-space: nowrap;';
            html += cr + '  background-position: -' + layer.offsetX + 'px -' + layer.offsetY + 'px;';
            html += cr + '  width: ' + layer.width + 'px;';
            html += cr + '  height: ' + layer.height + 'px;';
            html += cr + '}';
            html += cr + '</code></pre>';
            html += cr + '  <div class="' + layer.name + '"></div>';
        }
        html += cr + '</div>';

        html += cr + '<div class="footer">';
        html += cr + '  <div class="legal pure-g">';
        html += cr + '    <div class="pure-u-1-2">';
        html += cr + '      <p class="legal-license">';
        html += cr + '        Designed by <a href="https://twitter.com/kumak1">@kumak1</a>.<br>';
        html += cr + '        Code licensed under <a target="_blank" href="https://github.com/twbs/bootstrap/blob/master/LICENSE">MIT</a>.';
        html += cr + '      </p>';
        html += cr + '    </div>';
        html += cr + '  <div class="pure-u-1-2">';
        html += cr + '    <ul class="legal-links">';
        html += cr + '      <li><a href="https://github.com/kumak1/Psprite">GitHub Project</a></li>';
        html += cr + '    </ul>';
        html += cr + '    <p class="legal-copyright">';
        html += cr + '      &copy; 2014 kumak1. All rights reserved.';
        html += cr + '    </p>';
        html += cr + '  </div>';
        html += cr + '</div>';

        html += cr + '</body>';
        html += cr + '</html>';

        return html;
    }

    //CSS生成
    function GenerateCSS(layerInfo) {
        const cr = "\r\n";
        var css = "";

        for (var i = 0, len = layerInfo.length; i < len; i++) {
            css += ('.' + layerInfo[i].name + ',');
        }
        css = css.slice(0, -1);

        css += cr + '{';
        css += cr + '  background-image: url("sprite.png");';
        css += cr + '  background-repeat: no-repeat;';
        css += cr + '  display: block;';
        css += cr + '  overflow: hidden;';
        css += cr + '  text-indent: 100%;';
        css += cr + '  white-space: nowrap;';
        css += cr + '}';

        for (var i = 0, len = layerInfo.length; i < len; i++) {
            var layer = layerInfo[i];
            css += cr + '.' + layer.name + ' {';
            css += cr + '  background-position: -' + layer.offsetX + 'px -' + layer.offsetY + 'px;';
            css += cr + '  width: ' + layer.width + 'px;';
            css += cr + '  height: ' + layer.height + 'px;';
            css += cr + '}';
        }

        return css;
    }

    // ファイル出力
    function FileOutput(filename, arg) {
        fileObj = new File(filename);
        flag = fileObj.open("w");

        if (flag == true) {
            fileObj.write(arg);
            fileObj.close();
        } else {
            alert(def.msgFileOutputFalse);
        }
    }

    // 画像出力
    function ImageOutput(filename) {
        fileObj = new File(filename);
        flag = fileObj.open("w");

        if (flag == true) {
            pngOpt = new ExportOptionsSaveForWeb();
            pngOpt.format = SaveDocumentType.PNG;
            pngOpt.PNG8 = false;
            pngOpt.includeProfile = false;
            pngOpt.interlaced = false;
            pngOpt.alphaChannels = true;
            activeDocument.exportDocument (fileObj, ExportType.SAVEFORWEB, pngOpt);
        } else {
            alert(def.msgFileOutputFalse);
        }
    }
})();