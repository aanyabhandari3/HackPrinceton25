from composio import Composio
import os
from dotenv import load_dotenv

load_dotenv()

# Replace these with your actual values
gmail_auth_config_id = "ac_W6fC5Olryy0I" # Auth config ID created above
user_id = "0000" # UUID from database/application

composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))


def authenticate_toolkit(user_id: str, auth_config_id: str):
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
    )

    print(
        f"Visit this URL to authenticate Gmail: {connection_request.redirect_url}"
    )

    # This will wait for the auth flow to be completed
    connection_request.wait_for_connection(timeout=15)
    return connection_request.id


connection_id = authenticate_toolkit(user_id, gmail_auth_config_id)

# You can also verify the connection status using:
connected_account = composio.connected_accounts.get(connection_id)
print(f"Connected account: {connected_account}")
