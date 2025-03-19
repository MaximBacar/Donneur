from    email.mime.multipart    import MIMEMultipart
from    email.mime.text         import MIMEText
from    typing                  import Final
import  smtplib
import logging

class SendMail:
    SENDER_EMAIL : Final[str] = "Donneur Support <noreply@donneur.ca>"  
    def send_password_creation_email( user_email : str, link : str ):

        recipient_to : str = user_email
        
        subject = "Account Creation"
        message_body = f"Create your Donneur account using the following link.\n\n\n{link}"
        
        msg = MIMEMultipart()
        msg['From']     = SendMail.SENDER_EMAIL
        msg['To']       = recipient_to
        msg['Subject']  = subject
        

        msg.attach(MIMEText(message_body, 'plain'))
        
        try:
            with smtplib.SMTP('localhost') as server:
                server.send_message(msg, from_addr=SendMail.SENDER_EMAIL, to_addrs=user_email)
                logging.warning(f'EMAIL SENT : TO[{user_email}]')
            print("Email sent successfully!")
        except Exception as e:
            logging.error(str(e))
            print(f"Failed to send email: {e}")