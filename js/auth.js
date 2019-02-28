// var config = {
//     apiKey: "",
//     authDomain: "",
//     databaseURL: "",
//     projectId: "",
//     storageBucket: "",
//     messagingSenderId: ""
// };
// firebase.initializeApp(config);
function signUp() {
    let nme = document.getElementById('name').value;
    let name;
    if(nme !== undefined){
        name = nme.charAt(0).toUpperCase() + nme.slice(1)
    }
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let address = document.getElementById('address').value;
    let number = document.getElementById('number').value;
    let dob = document.getElementById('dob').value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((success) => {
            let userId = firebase.auth().currentUser.uid;
            let usrObj = {
                name,
                email,
                address,
                number,
                dob,
                userId
            }
            firebase.database().ref('users/' + userId).set(usrObj)
                .then((success) => {
                    swal({
                        title: "Account Created",
                        text: "Click button to go Login page",
                        icon: "success",
                        button: "continue",
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                    }).then(() => { window.location = "../html/login.html"; })
                })
        })
        .catch((error) => {
            swal({
                title: "Error",
                text: error.message,
                icon: "error",
                button: "ok",
                closeOnClickOutside: false,
                closeOnEsc: false,
            })
        })
}

function logIn() {
    let lEmail = document.getElementById('lEmail').value;
    let lPassword = document.getElementById('lPassword').value;
    firebase.auth().signInWithEmailAndPassword(lEmail, lPassword)
        .then((success) => {
            localStorage.setItem("userAuth", JSON.stringify(success))
            swal({
                title: "Successfully LogIn",
                text: "Click button to go Task page",
                icon: "success",
                button: "continue",
                closeOnClickOutside: false,
                closeOnEsc: false,
            }).then(() => { window.location = "../html/task.html"; })
        })
        .catch((error) => {
            swal({
                title: "Error",
                text: error.message,
                icon: "error",
                button: "ok",
                closeOnClickOutside: false,
                closeOnEsc: false,
            })
        })
}

function logout() {
    firebase.auth().signOut()
        .then(() => {
            localStorage.removeItem("userData");
            localStorage.setItem("userAuth", JSON.stringify({ user: null }))
            swal({
                title: "Succesfully LogOut",
                icon: "success",
                button: "OK",
                closeOnClickOutside: false,
                closeOnEsc: false,
            }).then(() => { window.location = "./login.html" })
        })
        .catch((error) => {
            swal({
                title: "Opx",
                text: error.message,
                icon: "error",
                button: "OK",
                closeOnClickOutside: false,
                closeOnEsc: false,
            })
        })
}

function verify() {
    let get = localStorage.getItem('userAuth');
    let data = JSON.parse(get);
    if (data.user === null) {
        swal({
            title: "Error",
            text: "Pleas Login  first to use this app",
            icon: "error",
            button: "OK",
            closeOnClickOutside: false,
            closeOnEsc: false,
        }).then(() => { window.location = "./login.html" })
    } else {
        firebase.database().ref("users/" + data.user.uid).once("value", (usr) => {
            let userData = usr.val()
            localStorage.setItem("userData", JSON.stringify(userData))
            let heading;
            if(userData.name !== undefined){
                heading = `Hi ${userData.name}`
            }else{
                heading = `Hello ${userData.email}`
            }
            document.getElementById('h1').innerHTML = heading;
        }).then(()=>{
            document.getElementById('class').style.display = "block";
            showTasks()
        })
    }
}

function addTask(){
    let task = document.getElementById('task').value;
    let uId = localStorage.getItem('userAuth');
    let id = JSON.parse(uId);
    let time = firebase.database.ServerValue.TIMESTAMP
    let tskObj = {
        task,
        time
    }    
    firebase.database().ref("tasks/" + id.user.uid)
        .push(tskObj)
        .then((success)=>{
            let key = success.key
            firebase.database().ref(`tasks/${id.user.uid}/${key}`).once("value", (e)=>{
                let obj = e.val()
                obj.key = key;
            // var myDate = new Date(obj.time*1000);
            // var formatedTime=myDate.toJSON();
            //     console.log(formatedTime)
                firebase.database().ref(`tasks/${id.user.uid}/${key}`).set(obj)
            }).then((success)=>{
                document.getElementById('task').value = "";
                showTasks()
            })
        })
        .catch((error)=>{
            swal({
                title: "Error",
                text: error.message,
                icon: "error",
                button: "OK",
                closeOnClickOutside: false,
                closeOnEsc: false,
            })
        })
    }
let array = [];
function showTasks(){
    array = [];
    let ul = document.getElementById('data');
    ul.innerHTML = "";
    let uId = localStorage.getItem('userAuth');
    let id = JSON.parse(uId);
    firebase.database().ref(`tasks/${id.user.uid}`).once("value", (t)=>{
        let tsk = t.val();
        for(let key in tsk){
            array.push(tsk[key])
        }
        let counter = 1;
        ul.innerHTML = array.map((v)=>`<li style="height: 50px;" key="${v.key}" class="list-group-item">${counter++}) &nbsp;<strong> ${v.task}</strong><div style="display: inline-block; float: right;"> <button onClick="edit(this)" class="btn btn-primary">Edit</button>&nbsp;<button onClick="delet(this)" class="btn btn-danger" >Delet</button></div></li>`).join("\n") 
        
    })
}

function delet(t){
    let tskKey = t.parentNode.parentNode.getAttribute('key'); 
    let usr = localStorage.getItem("userAuth")
    let usrId = JSON.parse(usr)
    swal("Are you sure you want to delet this task?", {
        dangerMode: true,
        buttons: true,
    }).then((s)=>{
        if(s !== null){
            firebase.database().ref(`tasks/${usrId.user.uid}`).child(tskKey).remove()
            .then((success)=>{
                swal({
                    title: "Task Deleted",
                    icon: "info",
                    button: "OK",
                    closeOnClickOutside: false,
                    closeOnEsc: false,
                }).then(()=>{
                    showTasks()
                })
            })
        }else{
            swal("Task not delet", {
                buttons: false,
                timer: 2000,
            });
        }
    })
    .catch((err)=>{
        swal({
            title: "Error",
            text: error.message,
            icon: "error",
            button: "OK",
            closeOnClickOutside: false,
            closeOnEsc: false,
        })
    })
}

function edit(t){
    let tsk = t.parentNode.parentNode.getElementsByTagName('strong')[0].innerHTML;
    let tskKey = t.parentNode.parentNode.getAttribute('key');
    let usr = localStorage.getItem("userAuth")
    let usrId = JSON.parse(usr)
    swal({
        icon: "info",
        title: "Write Something",
        content: {
          element: "input",
          attributes: {
            value: tsk,
            type: "text",
          },
        },
        closeOnClickOutside: false,
        closeOnEsc: false,
      }).then((n)=>{
          if(n  !== "" && n !== " "){
            let newTsk = n;
            swal("Are you sure you want to edit this task?", {
                buttons: true,
            }).then((f)=>{
                if(f !== null){
                    firebase.database().ref(`tasks/${usrId.user.uid}/${tskKey}`).once("value", (e)=>{
                      let dta =  e.val()
                      dta.task = newTsk;
                      let time = firebase.database.ServerValue.TIMESTAMP
                      dta.time = time;
                      firebase.database().ref(`tasks/${usrId.user.uid}/${tskKey}`).set(dta).then(()=>{
                          swal({
                              title: "Edit Successful",
                              text: "Task has been edit",
                              icon: "success",
                              button: false,
                              timer: 3000,
                          }).then(()=>{
                            showTasks()
                          })
                      })
                    })
                }
            })
            }else{
                swal({
                    title: "Cant Edit",
                    text: "First write something in Edit field",
                    icon: "error",
                    button: false,
                    timer: 3000,
                })
          }
      })
      .catch((error)=>{
        swal({
            title: "Error",
            text: error.message,
            icon: "error",
            button: "OK",
            closeOnClickOutside: false,
            closeOnEsc: false,
        })
    })
}