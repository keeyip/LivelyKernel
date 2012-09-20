module('apps.ChartBuildingBlocks').requires('lively.morphic.AdditionalMorphs', 'apps.d3').toRun(function() {


lively.morphic.Box.subclass('apps.ChartBuildingBlocks.ChartRenderer',

'Visuals', {
    activeRenderPartClassName: 'active-render-part',

    markMorph: function(morph){
        morph.addStyleClassName(this.activeRenderPartClassName);
        return morph;
    },
    unmarkAllMorphs: function() {
        this.submorphs.each(function(m){
            m.removeStyleClassName(this.activeRenderPartClassName)
        }, this);
    },
},
'Hook dispatch', {
    getMorphForHook: function(hookName) {
        var m, i = this.submorphs.length - 1;
        for (; (m = this.submorphs[i]); i--) {
            var hook = m[hookName];
            if (hook && typeof hook === 'function') {
                this.markMorph(m);
                return m;
            }
        }
        return null;
    },
    dispatchTemplateHook: function(hookName) {
        // Dispatches a given hook function and returns its return value.
        // If hook is not found in a submorph the hook is searched for in
        // this. If the function is not implemented in this either, an
        // error is thrown.
        if (hookName) {
            var hookMorph = this.getMorphForHook(hookName),
                args = Array.prototype.slice.call(arguments, 1, arguments.length);

            if (hookMorph) {
                return hookMorph[hookName].apply(this, args);
            } else if (this[hookName] && typeof this[hookName] === 'function') {
                    return this[hookName].apply(this, args);
            } else {
                throw 'Cannot render chart because hook "' + hookName + ' was not found.';
            }
        }
    },
    dispatchUpdateHook: function(args) {
        // Dispatches a given hook and returns true if an implementation was found
        // in a submorph, or false if not.
        var hookName = args.callee.methodName,
            argArray = Array.prototype.slice.call(args);
        if (hookName) {
            var hookMorph = this.getMorphForHook(hookName);
            if (hookMorph) {
                hookMorph[hookName].apply(this, argArray);
                return true;
            } else {
                return false;
            }
        }
    }
},

'Accessing', {
    getContextPane: function() {
        return this.contextPane;
    },
    getDrawingPane: function() {
        return this.drawingPane;
    }
},

'Drawing hook defaults', {
    prepareContext: function(context) {
        // Override to customize the DOM context of the chart.
        // Returns an SVG node with a group node per default.
        var ctxH = $(context).height(),
            ctxW = $(context).width();

        $(context).empty();

        return d3.select(context).append("svg:svg")
            .attr("width", ctxW)
            .attr("height", ctxH)
            .append("svg:g");
    },
    makeDrawingPane: function(context, area) {
	// Override to create a custom surface to be used as a 
	// drawing context for the chart content.
        // Per default returns the context itself.
        return context;
    },
    setupScales: function(data, area) {
	// Override to draw the information contained by the dataset's series
	// onto a drawing context (in general the content pane
	// generated by the 'makeContentPane' method).
        return {};
    },
    drawDimensions: function(context, dimensions, area) {
        // Override this method to set up and draw your chart's axes
	//
	// context: a d3 node to draw your axes onto,
	// dimensions: an array of simple dimension representations
	// (i.e. [{id: 'x', title: 'X Axis', unit: 'Time'}])
    },
    drawSeries: function(context, series) {
	// Override to draw the information contained by the dataset's series
	// onto a drawing context (in general the content pane
	// generated by the 'makeContentPane' method).
    },
},

'Update hooks', {
    updateDimensions: function(dims) {
        return this.dispatchUpdateHook(arguments);
    },
    updateSeries: function(s) {
        return this.dispatchUpdateHook(arguments);
    },
    updateData: function(data) {
        return this.dispatchUpdateHook(arguments);
    },
    updateScales: function() {
        var r = this.dispatchUpdateHook(arguments);
        this.updateDimensions();
        this.updateSeries();
        return r;
    }

},

'Drawing', {
    draw: function(context, data, drawingArea) {
        // Clear the visual indiciators about which 
        // morphs are used and which ones are not
        this.unmarkAllMorphs();

        var dimensions = data.getDimensions(),
            series = data.getSeries(),

            // If no area was defined, just take the context bounds
            area = drawingArea || new Rectangle(
                0,0,$(context).width(), $(context).height());

        // Creates an SVG context for the chart
        this.contextPane = this.dispatchTemplateHook('prepareContext', context);

        // Template hook for making a pane for the actual content
        this.drawingPane = this.dispatchTemplateHook('makeDrawingPane', this.contextPane, area);

        // Create scales for the data's dimensions
        this.dispatchTemplateHook('setupScales', data, area);

        // Template hook for drawing axes
        this.dispatchTemplateHook('drawDimensions', this.contextPane, dimensions, area);

        // Template hook for drawing the series
        this.dispatchTemplateHook('drawSeries', this.drawingPane, series);
    },
});



lively.morphic.HtmlWrapperMorph.subclass('apps.ChartBuildingBlocks.ChartDisplay',

'init', {
    initialize: function($super, bounds) {
        $super(bounds);
        this.redrawOnResize = true;
    }
},
'drawing', {
    getDrawingArea: function() {
        var padding = this.padding || [0,0,0,0];
        return new Rectangle(
                padding[3],
                padding[0],
                this.getExtent().x - padding [3] - padding[1],
                this.getExtent().y - padding [2] - padding[0]
            );
    },
    draw: function() {
        var context = this.renderContext().shapeNode,
            area = this.getDrawingArea();
        if (this.chartRenderer.draw) {
            this.chartRenderer.draw(context, this.chartData, area);
        } else {
            console.warn('The ChartDisplay has no ChartRenderer so nothing can be drawn right now.');
        }
        // call connected ChartRenderer.draw(context)
    },

});


}) // end of module