<%--
  Created by IntelliJ IDEA.
  User: ducit
  Date: 3/10/2022
  Time: 11:09 PM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
<h3>${message}</h3>
<form action="/Lab3_war/LoginServlet" method="post">
    Username123: <input type="text" name="username123" value="${username}"> <br>
    password123: <input type="password" name="password123" value="${password}">
    <br>
    <input type="checkbox" name="remember"> Remember me ?
    <hr>
    <button>login</button>
</form>
</body>
</html>
