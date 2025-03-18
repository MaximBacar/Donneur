from    email.mime.multipart    import MIMEMultipart
from    email.mime.text         import MIMEText
from    typing                  import Final
import  smtplib


class SendMail:
    SENDER_EMAIL : Final[str] = "Donneur Support <noreply@donneur.ca>"  
    def send_password_creation_email( user_email : str, link : str ):


        recipient_to : str = user_email
        
        subject = "Account Creation"
        message_body = "This is a test email sent from Python using the local Postfix server on Ubuntu."
        
        msg = MIMEMultipart()
        msg['From']     = SendMail.SENDER_EMAIL
        msg['To']       = recipient_to
        msg['Subject']  = subject
        

        msg.attach(MIMEText(message_body, 'plain'))
        
        try:
            with smtplib.SMTP('localhost') as server:
                server.send_message(msg, from_addr=SendMail.SENDER_EMAIL, to_addrs=user_email)
            print("Email sent successfully!")
        except Exception as e:
            print(f"Failed to send email: {e}")