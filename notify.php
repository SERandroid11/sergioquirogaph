<?php
// Archivo: notify.php (VERSIÓN FINAL Y FUNCIONAL)

// --- PASO 1: Forzar la visualización de todos los errores ---
// Esto nos ayudará a ver el último error si es que ocurre.
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// --- PASO 2: Carga manual de la librería ---
// Esto ya sabemos que está en la ubicación correcta.
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';


// --- CABECERAS ---
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// --- OBTENCIÓN DE DATOS ---
$json_data = file_get_contents('php://input');
$data = json_decode($json_data);

// Verificación de que los datos llegaron
if (!$data || !isset($data->albumCode) || !isset($data->favorites) || empty($data->favorites)) {
    http_response_code(400); 
    echo json_encode(["message" => "Datos incompletos."]);
    exit();
}

// Se crea la instancia de PHPMailer con su nombre completo
$mail = new \PHPMailer\PHPMailer\PHPMailer(true);

try {
    // --- CONFIGURACIÓN DEL SERVIDOR DE CORREO (SMTP) ---
    // $mail->SMTPDebug = 2; // <-- ¡CAMBIO! Desactivado para que no envíe texto extra al navegador.
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'sergioquirogaph21@gmail.com';
    $mail->Password   = 'zhxnjgmmwcuublzc'; 

    $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;

    // --- REMITENTE Y DESTINATARIO ---
    $mail->setFrom('sergioquirogaph21@gmail.com', 'Notificaciones Fotografía'); 
    $mail->addAddress('sergioquirogaph21@gmail.com');

    // --- CONTENIDO DEL CORREO ---
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    $mail->Subject = '✅ Nueva selección de favoritas para el álbum: ' . htmlspecialchars($data->albumCode);

    $body = '<h1>¡Un cliente ha finalizado su selección!</h1>';
    $body .= '<p><strong>Álbum:</strong> ' . htmlspecialchars($data->albumCode) . '</p>';
    $body .= '<p><strong>Fotos favoritas seleccionadas (' . count($data->favorites) . '):</strong></p>';
    $body .= '<ul>';
    foreach ($data->favorites as $fav) {
        $body .= '<li>' . htmlspecialchars($fav) . '</li>';
    }
    $body .= '</ul>';
    $body .= '<p>¡Ya puedes contactar al cliente para los siguientes pasos!</p>';
    
    $mail->Body = $body;

    $mail->send();
    
    http_response_code(200);
    echo json_encode(["message" => "Notificación enviada con éxito."]);

} catch (\PHPMailer\PHPMailer\Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "No se pudo enviar el correo. Error: {$mail->ErrorInfo}"
    ]);
}