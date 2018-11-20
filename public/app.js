'use strict';

function userLogin(_username, _password){
    const user = {
        username: _username,
        password: _password
    };
    $.ajax({
        url: '/api/auth/login',
        data: JSON.stringify(user),
        contentType: 'application/json', 
        method: 'POST'
    })
    .done(token => {
        localStorage.setItem('authToken', token.authToken)
        localStorage.setItem('username', _username);
        window.location.href = 'events.html'
    })
    .fail(err => {
        $('.login_error').prop('hidden', false);
        $('#login_username').val('');
        $('#login_password').val('');
    });
}

function handleLoginSubmit(){
    $('.login_form').on('submit', e => {
        e.preventDefault();
        const username = $('#login_username').val();
        const password = $('#login_password').val();
        userLogin(username, password);
    });
}

function handleRegisterClick(){
    $('.register_path').click(e => {
        $('.login_container').prop('hidden', true);
        $('.signup_container').prop('hidden', false);
    })
    watchSignupSubmit();
}

function handleShowLoginClick() {
    $('.login_path').click(e => {
        $('.signup_container').prop('hidden', true);
        $('.login_container').prop('hidden', false);
    })
}

handleShowLoginClick();

function handleLoginClick(){

}

function registerUser(_username, _password, _firstName, _lastName){
    const user = {
        username: _username,
        password: _password,
        firstName: _firstName,
        lastName: _lastName
    };
    $.ajax({
        url: '/api/users',
        data: JSON.stringify(user),
        contentType: 'application/json',
        method: 'POST'
    })
    .done(() => {
        $('.login_container').prop('hidden', false);
        $('.signup_container').prop('hidden', true);
    })
    .fail(err => {
        if(err.responseJSON.message === `username already exist`) {
            $('.username_error').prop('hidden', false);
            $('#signup_username').val('');
            $('#signup_password').val('');
        }else if(err.responseJSON.location === `password`) {
            $('#signup_username').val('');
            $('#signup_password').val('');
            $('.password_info').html('Too short! Try again.')
        }
        console.error(err);
    })
}

function watchSignupSubmit(){
    $('.signup_button').on('click', e => {
        e.preventDefault();
        const username = $('#signup_username').val();
        const password = $('#signup_password').val();
        const firstName = $('#signup_firstName').val();
        const lastName = $('#signup_lastName').val();
        registerUser(username, password, firstName, lastName);
    })
}

//function to watch submit for user

$(function(){
    handleLoginSubmit();
    handleRegisterClick();
})