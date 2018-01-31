
window.onload = function() {

          //Get a reference to the link on the page
          // with an id of "mylink"
          var a = document.getElementById("paper");

          //Set code to run when the link is clicked
          // by assigning a function to "onclick"
          a.onclick = function() {

            // Your code here...
            alert("I am root");

            //If you don't want the link to actually 
            // redirect the browser to another page,
            // "google.com" in our example here, then
            // return false at the end of this block.
            // Note that this also prevents event bubbling,
            // which is probably what we want here, but won't 
            // always be the case.
            return false;
          }
        }