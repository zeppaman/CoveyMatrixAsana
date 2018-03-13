/**
 * index.js
 * - All our useful JS goes here, awesome!
 */
var router = new VueRouter({
  mode: 'history',
  routes: []
});

// Init Vue!
var app = new Vue({
  router,
  el: '#demo',
  created: function(){
    console.log("created");
    let self = this;
    
    Asana.Dispatcher.maybeReauthorize=function()
    {
      console.log("autorization neede");
      localStorage.clear();
      if(window.location.href.indexOf("localhost")>1)
      {
        window.location="https://app.asana.com/-/oauth_authorize?response_type=token&client_id=579919199829674&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2F&state=<STATE_PARAM>";
      }
      else
      {
        window.location="https://app.asana.com/-/oauth_authorize?response_type=token&client_id=588456653596032&redirect_uri=https%3A%2F%2Fapp.covey-matrix-asana.danielefontani.it&state=<STATE_PARAM>";
      }
    };

    if(!localStorage.getItem("token"))
    {
      Asana.Dispatcher.maybeReauthorize();
    }
    else
    {
      this.loadTasks();
    }
  },
	mounted: function () {
    console.log("mounted");
    this.displayData= new Array();
    this.displayData.isInited=false;
   
    let hash = this.$route.hash;
    if(hash)
    { 
      let map=new Array();
       this.$route.hash.substring(1).split("&").forEach(function(element){
         let item=element.split("=");
         map[item[0]]=item[1];       
        });
        if(map["access_token"])
        {
          localStorage.setItem("token",map["access_token"]);
          window.location.href="/";
        }
    }
    

    
  },
    methods: {
      closeTask: function(task)
      {
        self=this;
        var client = Asana.Client.create().useAccessToken(localStorage.getItem("token"));
        client.tasks.update(task.id,{
          completed:true
        } ).then(function(data){
          console.log(data);
          self.displayData.items.forEach(function(list){
            list.forEach(function(element)
            {
              if(element.id==task.id)
              {
                list.pop(element);
              }
            });
          });
          self.$forceUpdate();
        });
      },
      logout: function()
      {
        localStorage.clear();
        window.location.href="/";
      },
      showHideSettigns: function()
      {
        this.showSettings=!this.showSettings;
      },
        loadTasks:function(event)
        {
         

         var self = this;
          var client = Asana.Client.create().useAccessToken(localStorage.getItem("token"));
          client.users.me()
            .then(function(meReq) {
         // console.log("user","done");
              self.currentUser=meReq;
            self.defaultWorkspace=self.currentUser.workspaces[0];
            
              client.tags.findByWorkspace( self.defaultWorkspace.id,{archived:false})
                          .then(function(tags) {
               // console.log("findByWorkspace","done");
                            self.tags=tags;
                           
                            self.tags.data.forEach(function(element) {
                                console.log(element.name.toLowerCase());
                              if(element.name.toLowerCase()=="important")
                              {
                                console.log("found!!!");
                                self.importantTag=element;
                              }
                              
                              
                              if(element.name.toLowerCase()=="urgent")
                              {
                                console.log("found!!!");
                                self.urgentTag=element;
                              }
                           
                              console.log(  self.importantTag);
                              
                            client.tasks.findAll({
                              workspace: self.defaultWorkspace.id,
                              assignee: self.currentUser.id,
                              completed_since:new Date(),
                              opt_fields: 'id,name,assignee_status,completed,tags'})
                            .then(function(collection) {
                             // console.log("findAll","done");
                              //console.log(collection.data);
                              self.tasks=collection.data;
                              
                                // self.uiTasks=new Array();
                                // self.xiTasks=new Array();
                                // self.uxTasks=new Array();
                                // self.xxTasks=new Array();
                              
                                 self.displayData.items= new Array();
                               self.displayData.isInited=true;
                                
                                self.displayData.items.push(new Array());
                                self.displayData.items.push(new Array());
                                self.displayData.items.push(new Array());
                                self.displayData.items.push(new Array());
                              
                              collection.data.forEach(function(element) {
                              
                                let isImportant=self.containsTag(element,self.importantTag);
                                let isUrgent=self.containsTag(element,self.urgentTag);
                                
                                console.log(" =>",isImportant,isUrgent)
                             
                                element.url="https://app.asana.com/0/"+self.currentUser.id	+"/"+element.id+"/f";
                                
                                console.log(  element.url);
                                if(isImportant && isUrgent)
                                {
                                  //self.uiTasks.push(element); 
                                  self.displayData.items[0].push(element); 
                                }
                                else if(!isImportant && !isUrgent)
                                {
                                 // self.xxTasks.push(element);
                                   self.displayData.items[3].push(element);
                                }
                                 else if(isImportant )
                                {
                                  //self.xiTasks.push(element);
                                  self.displayData.items[2].push(element); 
                                }
                                 else if(isUrgent)
                                {
                                  // self.uxTasks.push(element);
                                   self.displayData.items[1].push(element);
                                }
                                
                                
                               
                                
                              });
                              
                              
                                
                              self.showSettings=false;
                                app.$forceUpdate();
                                
                                
                            });

                        });
             
            });
             });
           
          },
      containsTag: function(task,tag)
      {
        let result=false;
         // console.log("containsTags", task.id, tag.id, task.tags)
        task.tags.forEach(function(element) {
        //  cosole.log("check", element.id, tag.id)
          if(element.name===tag.name)
            {
              console.log(task.name," IS ",tag.name)
              result= true;
            }
        });
        return result;
        
      },
    },
  
  data:{
    showSettings:true,
    pat: '',
    currentUser:{
      email:"xxx",
    },
    defaultWorkspace:{},
    tags:[],
    urgentTag:{},
    importantTag:{},
    allTasks:[],
    colors: [
        { hex: "#f6d258" },
        { hex: "#efcec5" },
        { hex: "#d1af94" },
        { hex: "#97d5e0" },
      ],
    // uiTasks:[],
    // xiTasks:[],
    // ixTaskx:[],
    // xxTaskx:[],
    displayData:{isInited:false},
  },
   
  
});




