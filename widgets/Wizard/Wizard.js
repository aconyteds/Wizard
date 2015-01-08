define(['dojo/_base/declare','dijit/_WidgetBase','dijit/_TemplatedMixin','dijit/_WidgetsInTemplateMixin','dojo/text!./templates/uploader.html',
"dojox/form/Uploader", "dijit/form/Form", "dijit/form/Button","dojo/_base/lang"],
    function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, uploaderTemplate,
    Uploader, Form, Button, lang){
        var WizardDijit=declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],{
            widgetsInTemplate: true,
            templateString: uploaderTemplate,
            postCreate:function(){
                this.nextButton.onClick=lang.hitch(this, this._next);
            },
            _next:function(){
                console.log(this.formUploader.getFileList());
            }
        });
        return WizardDijit;
    }
);