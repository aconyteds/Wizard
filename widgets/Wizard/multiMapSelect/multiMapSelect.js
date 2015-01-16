define(["dojo/_base/declare","dijit/_WidgetBase","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin", "dojo/text!./templates/multiMapSelect.html", "dojo/request/xhr",
"esri/map",  "esri/graphic", "dijit/form/Button", "dojo/_base/array", "dojo/on", "dojo/dom-construct", "dojo/topic", "dojo/_base/lang",  "esri/geometry/Extent"],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, templateString, xhr,
    map,  Graphic, Button, array, on, domConstruct, topic, lang, Extent){
    var multiMapSelect=declare([ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],{
        widgetsInTemplate:true,
        templateString:templateString,
        _totalMaps:0,
        postCreate:function(){
            var me=this;
            xhr("widgets/Wizard/multiMapSelect/points.json", {handleAs: "json"}).then(function(data){
                var length=me.selections;
                while(length--){
                    var tempData=data;
                    tempData.symbol.size=(length+1)*4;
                    var myMap=new me._map({gphc:new Graphic(tempData), _initExt:new Extent(tempData.extent)}).placeAt(me.mapContainer);
                }
            });
        },
        _map:declare([_WidgetBase],{
            _initExt:null,
            constructor:function(){
                this.domNode=domConstruct.create("div", {style:"display:inline-block; padding-right:5px; margin-bottom:5px;"});
            },
            postMixInProperties:function(){
                this.gphc._extent=this._initExt;
            },
            postCreate:function(){
                var mapSize=200;
                this.mapContainer=domConstruct.create("div",null, this.domNode);
                //create Map
                this.map=new map(this.mapContainer, {
                    basemap:"satellite",
                    logo:false,
                    slider:false,
                    showAttribution:false,
                    extent:this._initExt
                });
                this.map.attr("style", "height:"+mapSize+"px; width:"+mapSize+"px; display:inline-block;");
                
                //Create Button to Select Map
                this.selectButton=new Button({label:"Select", style:"display:block; text-align:center;"}).placeAt(this.domNode);
                
                //Setup On Load Handler
                on.once(this.map, "load", lang.hitch(this, function(){
                    this.map.graphics.add(this.gphc);
                    this.map.resize();
                    this.map.reposition();
                    setTimeout(lang.hitch(this, function() {this._initHandlers();}), 2000);
                }));
            },
            _initHandlers:function(){
                //Attach Broadcaster
                var mapPausable=on.pausable(this.map, "extent-change", function(){
                    topic.publish("multiMapSelect/extent-change", {id:this.id, extent:this.extent});
                });
                
                //Attach Listener
                topic.subscribe("multiMapSelect/extent-change", lang.hitch(this, function(data){
                    if(this.map.id!==data.id&&this.map.extent!==data.extent){
                        mapPausable.pause();
                        this.map.setExtent(data.extent).then(lang.hitch(this, function(){
                            mapPausable.resume();
                        }));
                    }
                }));
            }
        })
    });
    return multiMapSelect;
});