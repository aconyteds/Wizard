define(['dojo/_base/declare','dijit/_WidgetBase','dijit/_TemplatedMixin','dijit/_WidgetsInTemplateMixin', "dojo/Stateful", "dojo/topic", "dojo/_base/lang", "dojo/dom-construct",
"dojox/form/Uploader", "dijit/form/Form", "dijit/form/Button", "dijit/form/Select", "dijit/form/TextBox",
'dojo/text!./templates/wizard.html', 'dojo/text!./templates/page1.html', 'dojo/text!./templates/page2.html', 'dojo/text!./templates/page3.html', 'dojo/text!./templates/page4.html',
'dojo/text!./templates/page5.html', 'dojo/text!./templates/page6.html'],
    function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Stateful, topic, lang, domConstruct,
    Uploader, Form, Button,  Select, TextBox, 
    wizardTemplate, page1Template, page2Template, page3Template, page4Template, 
    page5Template, page6Template){
        var WizardDijit=declare([_WidgetBase, _TemplatedMixin,  Stateful],{
            templateString: wizardTemplate,
            _currPage:0,
            _pages:[page1Template, page2Template, page3Template, page4Template, page5Template, page6Template],
            _subscriptions:[],
            postCreate:function(){
                this.watch("_currPage", function(name, oldValue, value){
                    this._changePage();
                });
                this._subscriptions.push(topic.subscribe("wizard/Next", lang.hitch(this, this._next)));
                this._subscriptions.push(topic.subscribe("wizard/Exit", lang.hitch(this,this._exit)));
            },
            startup:function(){
                this._changePage();
            },
            _next:function(){
                var _currPage=parseInt(this.get("_currPage"));
                _currPage++;
                this.set("_currPage", _currPage);
            },
            _exit:function(){
                if(this._currPage!==0){
                    var _currPage=parseInt(this.get("_currPage"));
                    _currPage--;
                    this.set("_currPage", _currPage);
                }
            },
            _changePage:function(){
                var newPage=new this._newPage({templateString:this._pages[this.get("_currPage")], nls:this.nls});
                domConstruct.empty(this.domNode);
                newPage.placeAt(this.domNode);
                newPage.startup();
            },
            _currPageSetter:function(value){
                this._currPage=value;
            },
            _currPageGetter:function(){
                return this._currPage;
            },
            _newPage:declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],{
                widgetsInTemplate:true,
                _next:function(){
                    topic.publish("wizard/Next", this);
                },
                _exit:function(){
                    topic.publish("wizard/Exit", this);
                }
            }),
            destroy:function(){
                for(var i in this._subscriptions){
                    this._subscriptions[i].remove();
                }
            }
        });
        return WizardDijit;
    }
);