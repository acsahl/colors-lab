<?php
	$inData = getRequestInfo();
	
	$color = $inData["color"];
	$userId = $inData["userId"];

	if (!is_readable(__DIR__ . '/db-config.php'))
	{
		returnWithError("Database is not configured");
		exit;
	}

	require_once __DIR__ . '/db-config.php';
	$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("INSERT into Colors (UserId,Name) VALUES(?,?)");
		$stmt->bind_param("ss", $userId, $color);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
