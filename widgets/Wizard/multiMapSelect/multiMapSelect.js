define(["dojo/_base/declare","dijit/_WidgetBase","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin", "dojo/text!./templates/multiMapSelect.html", "dojo/request/xhr",
"esri/map",  "esri/graphic", "dijit/form/Button", "dojo/_base/array", "dojo/on", "dojo/dom-construct", "dojo/topic", "dojo/_base/lang",  "esri/graphicsUtils"],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, templateString, xhr,
    map,  Graphic, Button, array, on, domConstruct, topic, lang, graphicsUtils){
    var multiMapSelect=declare([ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],{
        widgetsInTemplate:true,
        templateString:templateString,
        _totalMaps:0,
        postCreate:function(){
            var me=this;
            xhr("widgets/Wizard/multiMapSelect/points.json", {handleAs: "json"}).then(function(data){
                var length=me.selections;
                while(length--){
                    var gphc=new Graphic(data);
                    var ext=graphicsUtils.graphicsExtent([gphc]);
                    var myMap=new me._map({initExtent:ext}).placeAt(me.mapContainer);
                    on.once(myMap.map, "load", lang.hitch(myMap, function(){
                        this.mapPausible.pause();
                        this.map.graphics.add(gphc);
                        this.map.setExtent(ext).then(lang.hitch(this, function(){
                            this.mapPausible.resume();
                        }));
                    }));
                }
            });
        },
        _map:declare([_WidgetBase],{
            constructor:function(){
                this.domNode=domConstruct.create("div", {style:"display:inline-block; padding-right:5px; margin-bottom:5px;"});
            },
            postCreate:function(){
                var mapSize=200;
                this.mapContainer=domConstruct.create("div",null, this.domNode);
                //create Map
                this.map=new map(this.mapContainer, {
                    basemap:"satellite",
                    logo:false,
                    slider:false,
                    showAttribution:false
                });
                this.map.attr("style", "height:"+mapSize+"px; width:"+mapSize+"px; display:inline-block;");
                this.map.resize();
                //Attach Broadcaster
                this.mapPausible=on.pausable(this.map, "extent-change", function(){
                    topic.publish("multiMapSelect/extent-change", {id:this.id, extent:this.extent});
                });
                //Attach Listener
                topic.subscribe("multiMapSelect/extent-change", lang.hitch(this, function(data){
                    if(this.map.id!==data.id&&this.map.extent!==data.extent){
                       this. mapPausible.pause();
                        this.map.setExtent(data.extent).then(lang.hitch(this, function(){
                            this.mapPausible.resume();
                        }));
                        
                    }
                }));
                //Create Button to Select Map
                this.selectButton=new Button({label:"Select", style:"display:block; text-align:center;"}).placeAt(this.domNode);
            }
        })
    });
    return multiMapSelect;
});