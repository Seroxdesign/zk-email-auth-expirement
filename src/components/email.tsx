import React, { useState } from 'react';
import { Button, Input, message } from 'antd';

const RELAYER_API_URL = 'https://relayerapi.emailwallet.org';

interface EmailWalletProps {
  // Add any props if needed
}

const EmailWallet: React.FC<EmailWalletProps> = () => {
  const [tempEmail, setTempEmail] = useState('');
  const [fisherEmail, setFisherEmail] = useState('');
  const [accountAddress, setAccountAddress] = useState('');
  const [accountCode, setAccountCode] = useState('');

  console.log('data', tempEmail, fisherEmail, accountAddress, accountCode);

  const createAccount = async (email: string) => {
    try {
      const response = await fetch(`${RELAYER_API_URL}/api/createAccount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_addr: email }),
      });
      const address = await response.text();
      if (address !== '0x') {
        setAccountAddress(address);
        message.success('Account created successfully');
        return address;
      } else {
        message.error('Failed to create account');
        return '';
      }
    } catch (error) {
      console.error('Error creating account:', error);
      message.error('Error creating account');
      return '';
    }
  };

  const recoverAccountCode = async (email: string) => {
    try {
      const response = await fetch(`${RELAYER_API_URL}/api/recoverAccountCode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_addr: email }),
      });
      const result = await response.text();
      if (result) {
        message.success('Account recovery email sent');
      } else {
        message.error('Failed to send account recovery email');
      }
    } catch (error) {
      console.error('Error recovering account:', error);
      message.error('Error recovering account');
    }
  };

  const getWalletAddress = async (email: string, code: string) => {
    try {
      const response = await fetch(`${RELAYER_API_URL}/api/getWalletAddress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_addr: email, account_code: code }),
      });
      const address = await response.text();
      console.log(response, address);
      if (address) {
        setAccountAddress(address);
        message.success('Wallet address retrieved successfully');
      } else {
        message.error('Failed to fetch wallet address');
      }
    } catch (error) {
      console.error('Error getting wallet address:', error);
      message.error('Error getting wallet address');
    }
  };

  const changeRecoveryEmail = async (oldEmail: string, newEmail: string) => {
    // Note: This endpoint is not provided in the documentation.
    // You would need to implement this on the backend.
    try {
      const response = await fetch(`${RELAYER_API_URL}/api/changeRecoveryEmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_email: oldEmail, new_email: newEmail }),
      });
      const result = await response.text();
      if (result === 'success') {
        message.success('Recovery email changed successfully');
      } else {
        message.error('Failed to change recovery email');
      }
    } catch (error) {
      console.error('Error changing recovery email:', error);
      message.error('Error changing recovery email');
    }
  };

  const handleCreateTempAccount = async () => {
    const address = await createAccount(tempEmail);
    if (address) {
      // Inform the fisher about the temporary email (in a real app, you'd use a secure method)
      message.info(`Inform the fisher about the temporary email: ${tempEmail}`);
    }
  };

  const handleFisherClaimWallet = async () => {
    await recoverAccountCode(tempEmail);
    // In a real app, you'd implement a way for the fisher to enter the received code
    const userEnteredCode = prompt('Enter the account recovery code:');
    if (userEnteredCode) {
      setAccountCode(userEnteredCode);
      await getWalletAddress(tempEmail, userEnteredCode);
    }
  };

  const handleChangeRecoveryEmail = async () => {
    await changeRecoveryEmail(tempEmail, fisherEmail);
  };

  return (
    <div>
      <h1>Email Wallet</h1>
      <div>
        <Input
          placeholder="Enter temporary email"
          value={tempEmail}
          onChange={(e) => setTempEmail(e.target.value)}
        />
        <Button onClick={handleCreateTempAccount}>Create Temporary Account</Button>
      </div>
      <div>
        <Button onClick={handleFisherClaimWallet}>Fisher Claim Wallet</Button>
      </div>
      <div>
        <Input
          placeholder="Enter fisher's actual email"
          value={fisherEmail}
          onChange={(e) => setFisherEmail(e.target.value)}
        />
        <Button onClick={handleChangeRecoveryEmail}>Change Recovery Email</Button>
      </div>
      {accountAddress && (
        <div>
          <h2>Account Address:</h2>
          <p>{accountAddress}</p>
        </div>
      )}
      <div>
        <Input
          placeholder="get wallet address"
          value={tempEmail}
          onChange={(e) => setTempEmail(e.target.value)}
        />
        <Button onClick={() => getWalletAddress(tempEmail, accountCode)}>get wallet address</Button>
      </div>
    </div>
  );
};

export default EmailWallet;