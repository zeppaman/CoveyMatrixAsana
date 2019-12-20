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
  el: '.app',
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
    
   this.$on("closeTask", function(item){ this.closeTask(item);});
    
  },
    methods: {
      closeTask: function(task)
      {
        
        

        
        self=this;
        var client = Asana.Client.create().useAccessToken(localStorage.getItem("token"));
        client.tasks.update(task.id,{
          completed:true
        } ).then(function(data){

          let itemToiterate= self.displayData.items;
          itemToiterate.forEach(function(list,index){         
            //console.log("checking list",list,index);
               list.forEach(function(element)
               {
                 //console.log("checking element",element);
                  if(element.id==task.id)
                  {                 
                    list.pop(element);
                    self.displayData.items[index]=new Array();
                    Array.prototype.push.apply(self.displayData.items[index],list);
                  }
               });
           });
          // self.$set(self,"displayData",self.displayData);
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
          console.log("user","done");
              self.currentUser=meReq;
            self.defaultWorkspace=self.currentUser.workspaces[0];
            
              client.tags.findByWorkspace( self.defaultWorkspace.gid,{archived:false, limit:99})
                          .then(function(tags) {
               // console.log("findByWorkspace","done");
                            self.tags=tags;
                           
                            self.tags.data.forEach(function(element) {
                             //   console.log(element.name.toLowerCase());
                              if(element.name.toLowerCase()=="important")
                              {
                                //console.log("found!!!");
                                self.importantTag=element;
                              }
                              
                              
                              if(element.name.toLowerCase()=="urgent")
                              {
                               // console.log("found!!!");
                                self.urgentTag=element;
                              }
                           
                             // console.log(  self.importantTag);
                            });
                              
                            client.tasks.findAll({
                              workspace: self.defaultWorkspace.gid,
                              assignee: self.currentUser.gid,
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
                             
                                element.url="https://app.asana.com/0/"+self.currentUser.gid	+"/"+element.id+"/f";
                                
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
           
          },
      containsTag: function(task,tag)
      {
        let result=false;
         
        task.tags.forEach(function(element) {
          console.log("containsTags", task.id,task.name, tag.id, tag.name, element.id, element.name);
          if(element.id===tag.id)
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




