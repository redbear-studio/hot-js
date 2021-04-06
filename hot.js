var hotJS = function(initialState, namespace) {
    console.log(namespace)
    var ns = namespace
    var state = Object.assign({}, initialState)
    var _subscribers = {}

    const subscribe = function(el, keys) {
        keys.forEach(k => {
            if (_subscribers[k] == null) {
                _subscribers[k] = []    
            }
            _subscribers[k].push(el)
        })
      return el
    }

    const renameStateVars = (val) => {
        let newVal = val
        // console.log(state)
        Object.keys(state).forEach(k => {
            newVal = newVal.replace(k, "hot."+ns+"._state."+k)
        })
        return newVal
    }

    const replaceValues = (value) => {
        let itr = value.matchAll(/\{\{([^}]+)\}\}/g)
        let match = itr.next()
        let val = value
        while (!match.done) {
            const key = renameStateVars(match.value[1], ns)
            val = value.replace(match.value[0], eval(key))
            match = itr.next()
        }

        return val
    }

    const update = (elem) => {
        // update all attributes subscribed
        $.each($(elem).data(), (key, val) => {
            if (key != "subscribe" && key != "loop") {
                const val = replaceValues($(elem).data(key))
                if (jQuery.fn[key] != undefined) {
                    jQuery.fn[key].apply($(elem), [val])
                } else {
                    $(elem).attr(key, val)
                }
            }
        })
        
        if ($(elem).data('loop') != null) {
            let items = state[$(elem).data('loop')]
            let children = $(elem).children()
            $(elem).style('display', 'none')

            for (let c=0; c<children.length; c++) {
                let itr = value.matchAll(/\{\{([^}]+)\}\}/g)
                let match = itr.next()
                let val = value
                while (!match.done) {
                }
            }

            $(elem).parent().append(results)
        }
    }

    const publish = function(newState) {
        state = Object.assign(state, newState)
        let updateElems = []
        for (let i=0; i<Object.keys(newState).length; i++) {
            const k = Object.keys(newState)[i]
            updateElems = [ ...updateElems, ..._subscribers[k]]
        }
        const finals = [...new Set(updateElems)]
        finals.forEach(el => {
            update(el)
        })

        console.log("publish")
    }

    return {
        _state: state,
        publish: publish,
        forceUpdate: update,
        subscribe: subscribe
    }
}

jQuery.extend({
    initState: function(initial, params) {
        let parameters = Object.assign({
            namespace: 'default',
            loadingClass: null
        }, params)
        
        if (window.hot == null) {
            window.hot = {}
        }
        window.hot[parameters.namespace] = hotJS(initial, parameters.namespace)

        let selector = "[data-subscribe]"
        if (parameters.namespace != 'default') {
            selector = "[data-namespace=\""+parameters.namespace+"\"][data-subscribe]"
        }

        $(selector).each((index, elem) => {
            const subs = $(elem).data('subscribe').split(',')
            window.hot[parameters.namespace].subscribe(elem, subs)
            window.hot[parameters.namespace].forceUpdate(elem)
            if (parameters.loadingClass != null) {
                $(elem).removeClass(parameters.loadingClass)
            }
        })
    },
    setState: function(state, namespace) {
        let ns = namespace || "default"
        window.hot[ns].publish(state)
    },
    getState: function(namespace) {
        const ns = namespace || "default"
        return window.hot[ns]._state
    }
})