/* 
    Your app's JS goes here.
    
    --> rename this file to yourappname.js and 
        change .then('js/myapp.js') in index.html to 
        .then('js/yourappname.js')
        
    --> change all occurances of "MyApp" in this file
        to your app's actual name! (preferrably camel-cased)
*/

MyApp = {
    xmppDomain: 'proto.encorelab.org',
    groupchatRoom: 's3@conference.proto.encorelab.org',
    rollcallURL: 'http://rollcall.proto.encorelab.org',
    //rollcallURL: 'http://localhost:3000',
    //rollcallURL: 'http://localhost:8000/rollcall',
    
    // this is called in index.html
    init: function() {
        console.log("Initializing...")
        
        Sail.modules
            .load('Rollcall.Authenticator', {mode: 'picker'})
            .load('AuthStatusWidget')
            .load('Strophe.AutoConnector')
            .thenRun(function () {
                // takes care of event-binding magic... don't touch this
                Sail.autobindEvents(MyApp)
                
                console.log("Initialized.")
                $(Sail.app).trigger('initialized')
                return true
            })
    },
    
    authenticate: function() {
        console.log("Authenticating...")
        
        // Note that we use Rollcall for authentication here.
        // See: https://github.com/educoder/rollcall
        
        MyApp.rollcall = new Rollcall.Client(MyApp.rollcallURL)
        MyApp.token = MyApp.rollcall.getCurrentToken()
        
        if (!MyApp.token) {
            Rollcall.Authenticator.requestLogin()
        } else {
            MyApp.rollcall.fetchSessionForToken(MyApp.token, function(data) {
                MyApp.session = data.session
                $(MyApp).trigger('authenticated')
            })
        }
    },
    
    events: {
        sail: {
            /* 
               sail (xmpp) events
               --> add additional XMPP-based event handlers for your app here
            */
            
            // triggered via sail (XMPP) event generated in selfJoined...
            // this intercepts an event in XMPP groupchat that looks like this:
            //
            //   {"eventType":"here","payload":{"who":"test1"}}
            here: function(sev) {
                payload = sev.payload
                
                $('#welcome').text("Welcome "+payload.who+"!")
                    .show('drop', {duration: 'slow', direction: 'up'})
            },
            
            // this would intercept an event in XMPP groupchat that looks like this:
            //
            //   {"eventType":"my_event","payload":{}}
            // 
            // or just:
            //
            //   {"eventType":"my_event"}
            my_event: function(ev, sev) {
            },
            
            // another way to respond to sail events it to map them onto local events.
            // the following code would cause the 'foo' sail event to trigger the local
            // 'foobar' event -- you would also set up an 'foobar' event handler 
            // further down (under the events hash, outside of events.sail);
            // in this case the foobar event handler would receive two arguments:
            // a standard javascript event (`ev`) and the sail event (`sev`)
            foo: 'foobar'
        },
        
        
        /* 
           local events
           --> add additional local event handlers for your app here
        */
        
        initialized: function(ev) {
            MyApp.authenticate()
        },
        
        // this is triggered by $(MyApp).trigger('connected')
        // in sail.js after the user passes authentication and
        // connects to the XMPP server
        connected: function(ev) {
      	    Sail.app.groupchat.join()
            
            $('#username').text(session.account.login)
      	    $('#connecting').hide()
            
            $('#hello-world').show('drop', {duration: 'slow', direction: 'up'})
        },
        
        // this is triggered by $(MyApp).trigger('selfJoined')
        // in sail.js after the user joins the groupchat (after 'connected')
        selfJoined: function(ev) {
            // example of how to trigger a sail event
            // note that this will be handled by event.sail.here (further up in this file)
            sev = new Sail.Event('here', {who: MyApp.session.account.login})
            MyApp.groupchat.sendEvent(sev)
        },
        
        
        // this would be triggered by $(MyApp).trigger('anotherLocalEvent')
        anotherLocalEvent: function(ev) {
            
        },
        
        // sail event mapped to local event -- see the explenation above for "foo: 'foobar'".
        // `ev` is a standard javascript event object (for the most part you can probably just
        // ignore this, as it doesn't contain much useful data); `sev` is the sail event object,
        // with the typical sail event fiels like `sev.eventType` and `sev.payload`.
        foobar: function(ev, sev) {
            
        },
        
        // triggered in MyApp.unauthenticate once the user has been unauthenticated
        unauthenticated: function(ev) {
            document.location.reload()
        }
    }
}