# uvmClassSignup
An android app to make UVM class signup easy.

DOCS:
<h1>Welcome to UVM2: proxy server.</h1>
    <h3>/getUser?netId=netid&password=password</h3>
        returns user information</br>
    <h3>/addUser?netId=netid&password=password</h3>
        creates user</br>
        returns query</br>
    <h3>/addClasses?netId=netid&password=password&classes=RN1,RN2,RN3</h3>
        adds classes to user</br>
        returns query</br>
    <h3>/deleteClass?netId=netid&password=password&classes=RN1,RN2,RN3</h3>
        removes classes from user</br>
        returns query</br>
    <h4>For testing (so your "test" password saved on the DB isn't used): </h4>
    <h3>/register?netId=netid&password=password&classes=RN1,RN2,RN3&test=true</h3>
        using selenium, goes to banner, logs in, clicks to the registration page and registers you for up to 7 classes</br>
        sends back and image file (downloaded), showing you the results from banner</br>
    <h4>For use if the password in the DB is your actual password (dont use):</h4>
    <h3>/register?netId=netid&password=password</h3>
        using selenium, goes to banner, logs in, clicks to the registration page and registers you for up to 7 classes</br>
        sends back and image file (downloaded), showing you the results from banner</br>
