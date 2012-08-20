module('lively.morphic.tests.StyleSheet').requires('lively.morphic.tests.Helper').toRun(function() {

lively.morphic.tests.MorphTests.subclass('lively.morphic.tests.StyleSheet.CSSForMorphs',
'running', {
    setUp: function($super) {
        $super();
        this.createSomeMorphs();
    },
    createSomeMorphs: function() {
        // this method creates 4 morphs: yellowRectange is the ouyter parent
        // redRectangle its embedded submorph, blueRectangle1, blueRectangle1
        // are its submorphs
        var yellowRectangle = lively.morphic.Morph.makeRectangle(0,0, 300, 300);
        yellowRectangle.applyStyle({fill: Color.yellow});
        yellowRectangle.openInWorld();

        var redRectangle = lively.morphic.Morph.makeRectangle(25, 25, 250, 250);
        redRectangle.applyStyle({fill: Color.red});
        yellowRectangle.addMorph(redRectangle);

        var blueRectangle1 = lively.morphic.Morph.makeRectangle(10, 10, 150, 100);
        blueRectangle1 .applyStyle({fill: Color.blue});
        redRectangle.addMorph(blueRectangle1);

        var blueRectangle2 = lively.morphic.Morph.makeRectangle(10, 160, 150, 80);
        blueRectangle2 .applyStyle({fill: Color.blue});
        redRectangle.addMorph(blueRectangle2);
        
        this.yellowRectangle = yellowRectangle;
        this.redRectangle = redRectangle;
        this.blueRectangle1 = blueRectangle1;
        this.blueRectangle2 = blueRectangle2;
        
    },
    
    addStyleSheet: function() {
        var css = ".blue {"+
            "    border: 1px solid red;"+
            "}"+

            ".red > .blue {"+
            "    border: 1px solid green;"+
            "}"+

            ".blue:nth-child(2) {"+
            "    border: 1px solid yellow;    "+
            "}";
        this.yellowRectangle.setStyleSheet(css);
    }
    
},
'testing', {
    test01ProcessStyleSheet: function() {
        var css = ".some-class { color: red }";
        this.morph.addClassName('some-class');
        this.morph.processStyleSheet(css);

        this.assertEquals(1, this.morph.styleSheetRules.length, 'no rule assigned');
        this.assertEquals('.some-class', this.morph.styleSheetRules[0].selectorText, 'Selector of first rule is not .blue');
    },    
    test02FindCSSRulesForMorph: function() {
        return;
        this.assert(this.blueRectangle2.styleSheetRules, 'Blue Rectangle has no rule attribute');
        var css = this.blueRectangle2.styleSheetRules;
        this.assertEquals(2, css.length, 'Blue Rectangle has not exactly 3 rules');
        this.assertEquals('.blue', css[0].selectorText, 'Selector of first rule is not .blue');

    },

});

}) // end of module