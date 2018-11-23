"use strict";

//cache DOM//
const $landingContainer = $(".landing_container");
const $loginError = $landingContainer.find(".login_error");
const $usernameError = $landingContainer.find(".username_error");
const $loginUsername = $landingContainer.find("#login_username");
const $loginPassword = $landingContainer.find("#login_password");
const $loginForm = $landingContainer.find(".login_form");
const $registPath = $landingContainer.find(".register_path");
const $loginPath = $landingContainer.find(".login_path");
const $loginContainer = $landingContainer.find(".login_container");
const $signupContainer = $landingContainer.find(".signup_container");
const $signupUsername = $landingContainer.find("#signup_username");
const $signupPassword = $landingContainer.find("#signup_password");
const $signupFirstName = $landingContainer.find("#signup_firstName");
const $signupLastName = $landingContainer.find("#signup_lastName");
const $passwordInfo = $landingContainer.find(".password_info");
const $signupBtn = $landingContainer.find(".signup_button");

//bind events//
$loginForm.on("click", ".login_button", handleLoginSubmit);
$registPath.click(handleRegisterClick);
$loginPath.click(handleShowLoginClick);
$signupBtn.click(watchSignupSubmit);

function userLogin(_username, _password){
    const user = {
        username: _username,
        password: _password
    };
    $.ajax({
        url: "/api/auth/login",
        data: JSON.stringify(user),
        contentType: "application/json", 
        method: "POST"
    })
    .done(token => {
        localStorage.setItem("authToken", token.authToken)
        localStorage.setItem("username", _username);
        window.location.href = "events.html"
    })
    .fail(err => {
        $loginError.prop("hidden", false);
        $loginUsername.val("");
        $loginPassword.val("");
    });
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const username = $loginUsername.val();
    const password = $loginPassword.val();
    console.log(username + ", " + password );
    userLogin(username, password);
}

function handleRegisterClick(e) {
    e.preventDefault();
    $loginContainer.prop("hidden", true);
    $signupContainer.prop("hidden", false);
}

function handleShowLoginClick(e) {
        e.preventDefault();
        $signupContainer.prop("hidden", true);
        $loginContainer.prop("hidden", false);
}

function registerUser(_username, _password, _firstName, _lastName){
    const user = {
        username: _username,
        password: _password,
        firstName: _firstName,
        lastName: _lastName
    };
    $.ajax({
        url: "/api/users",
        data: JSON.stringify(user),
        contentType: "application/json",
        method: "POST"
    })
    .done(() => {
        $loginContainer.prop("hidden", false);
        $signupContainer.prop("hidden", true);
    })
    .fail(err => {
        if(err.responseJSON.message === `username already exist`) {
            $usernameError.prop("hidden", false);
            $signupUsername.val("");
            $signupPassword.val("");
        }else if(err.responseJSON.location === `password`) {
            $signupUsername.val("");
            $signupPassword.val("");
            $passwordInfo.html("Too short! Try again.")
        }
        console.error(err);
    })
}

function watchSignupSubmit(e){
        e.preventDefault();
        const username = $signupUsername.val();
        const password = $signupPassword.val();
        const firstName = $signupFirstName.val();
        const lastName = $signupLastName.val();
        registerUser(username, password, firstName, lastName);
}