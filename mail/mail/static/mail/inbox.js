document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

//  show the compose mail page
function compose_email() {

  // Show compose view and hide other views
  document.querySelectorAll('.mail-views').forEach(div =>{
    div.style.display='none';
  });
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').addEventListener('submit', post_email)
}


// Post a new email
function post_email(){
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(message => console.log(message))
  .catch(error => console.log(error));
  load_mailbox('sent');
}



// Load the selected mailbox
function load_mailbox(mailbox) {

  // refresh the mailbox and hide other views
  document.querySelectorAll('.mail-views').forEach(div =>{
    div.style.display='none';
  });
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails-view').innerHTML='';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails);
      emails.forEach(email => {

        // creating each email and asigning the required css for each
        const email_div = document.createElement('div');
        if (email["read"] || mailbox=='sent') {
          email_div.style.backgroundColor = "gray";
          email_div.style.color = "white";
        }
        else {
          email_div.style.backgroundColor = "white";
        }
        email_div.style.height='auto';
        email_div.style.border='1px solid black';
        email_div.style.borderRadius='4px';
        email_div.style.padding= '5px';
        email_div.style.margin= '2px 0px 2px 0px';

        if (mailbox != 'sent'){
          email_div.innerHTML = `<span>${email["sender"]} </span> <span style=""> ${email["subject"]}</span> <span style="float:right">${email["timestamp"]}</span>`;
        }
        else if (mailbox != 'archive'){
          email_div.innerHTML = `<span>To: ${email["recipients"]}</span> <span style="">${email["subject"]}</span> <span style="float:right">${email["timestamp"]}</span>`;
        }
        document.querySelector('#emails-view').append(email_div);
        email_div.addEventListener('click', () => view_email(email["id"], mailbox));
      })
    })
    .catch (error => console.log(error));
}

// View any perticuler email
function view_email(email_id, mailbox) {
  document.querySelectorAll('.mail-views').forEach(div =>{
    div.style.display='none';
  });
  document.querySelector('#email-view').style.display = 'block';
  get_email_box = document.querySelector('#email-view');
  get_email_box.innerHTML='';

  fetch(`emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      read_email(email["id"]);
      console.log(email);
      const email_box = document.createElement('div');
      email_box.innerHTML =
        `<p><strong>From </strong>${email["sender"]}</p> 
        <p><strong>To </strong>${email["recipients"]}</p> 
        <p><strong>Subject </strong>${email["subject"]}</p>
        <p>${email["timestamp"]}</p>
        <hr>
        <div style="height=400px">
        <p>${email["body"]}</p>
        </div>`;

      get_email_box.append(email_box);

      const reply_btn = document.createElement('button');
        reply_btn.innerHTML=`Reply`;
        reply_btn.className = "btn btn-primary";
        reply_btn.addEventListener('click',  () => reply_email(email));
        get_email_box.append(reply_btn);

      const archive_btn = document.createElement('button');
      archive_btn.className = "btn btn-primary";
      archive_btn.style.margin = "8px";
      if (!email["archived"]) {
          archive_btn.innerHTML = "Archive";
          archive_btn.addEventListener('click', () => archive_email(email_id, true));
      }
      else {
          archive_btn.innerHTML = "Unarchive";
          archive_btn.addEventListener('click', () => archive_email(email_id, false));
      }
      if (mailbox != 'sent'){
        get_email_box.append(archive_btn);
      }
    })
    .catch (error => console.log(error));
}


// Reply an email
function reply_email(email) {
  document.querySelectorAll('.mail-views').forEach(div =>{
    div.style.display='none';
  });
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = `${email["sender"]}`;
  if (email["subject"].substring(0,3)==="Re:"){
    document.querySelector('#compose-subject').value = `${email["subject"]}`;
  }
  else{
    document.querySelector('#compose-subject').value = `Re: ${email["subject"]}`;
  }
  template=document.createElement('div').innerHTML= `On ${email["timestamp"]} ${email["sender"]} wrote:
  ${email["body"]}
  `;
  document.querySelector('#compose-body').value='';
  document.querySelector('#compose-body').value=template;

  document.querySelector('#compose-form').addEventListener('submit', post_email)
}

// Update the email to read and vice-versa
function read_email(email_id) {

  fetch(`emails/${email_id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true
    })
  })
}


function archive_email(email_id, new_value) {

  fetch(`emails/${email_id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: new_value
    })
  })
  .then(result => {
    load_mailbox('inbox');
  });
}