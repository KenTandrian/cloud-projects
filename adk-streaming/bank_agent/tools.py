import os

def verify_otp(otp: str) -> bool:
    """
    Verifies the one-time password.

    Args:
        otp: The one-time password to verify.

    Returns:
        True if the OTP is valid, False otherwise.
    """
    # In a real application, this would call an OTP verification service.
    print(f"Verifying OTP: {otp}")
    return otp == os.environ.get("SAMPLE_OTP")

def create_transaction(transaction_details: str) -> str:
    """
    Creates a new transaction in the database.

    Args:
        transaction_details: A description of the transaction.

    Returns:
        A confirmation message.
    """
    # In a real application, this would connect to a database
    # and execute an INSERT query.
    print(f"Creating transaction: {transaction_details}")
    return f"Transaction '{transaction_details}' created successfully."
