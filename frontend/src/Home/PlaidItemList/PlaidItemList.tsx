import React, { useCallback, useState, useEffect, Fragment } from 'react';
import { Button } from '../../shared/components/Button/Button';
import { usePlaidLink } from 'react-plaid-link';
import {
    exchangeToken,
    clearItems,
    clearAllAccounts,
} from '../../shared/services/api';
import { StyledItemList } from './Styles';
import { PlaidItem } from './PlaidItem/PlaidItem';
import useItems from '../../shared/services/items';
import useAuth from '../../context/auth';

const config = {
    clientName: 'Your app name',
    env: 'sandbox',
    product: ['auth', 'transactions'],
    publicKey: process.env.REACT_APP_PLAID_PUBLIC_KEY as string,
    webhook: 'https://4525357d.ngrok.io/plaid/webhook',
};

export const PlaidItemList = () => {
    const {
        user: { id: userId },
    } = useAuth();
    const { itemsByUser, getItemsByUser } = useItems();

    const [items, setItems] = useState([]);

    useEffect(() => {
        getItemsByUser(userId);
    }, [userId, getItemsByUser]);

    useEffect(() => {
        const newItems = itemsByUser[userId] || [];
        setItems(newItems);
    }, [userId, itemsByUser]);

    const onSuccess = useCallback(
        async (publicToken, metadata) => {
            const {
                institution: { institution_id: institutionId },
            } = metadata;
            await exchangeToken({
                publicToken,
                institutionId,
                userId,
            });
            getItemsByUser(userId);
        },
        [userId, getItemsByUser],
    );

    const { open } = usePlaidLink({ ...config, onSuccess });

    // const handleSeedClick = async () => {
    //     let response = await seedFakeItem();
    //     let json = await response.json();
    //     let { public_token: publicToken } = json;

    //     await exchangeToken({ publicToken, institutionId: 'ins_1', userId });
    //     getItemsByUser(userId);
    // };

    const handleClearItems = async () => {
        await clearItems();
        getItemsByUser(userId);
    };

    const handleClearAllAccounts = async () => {
        await clearAllAccounts();
    };

    return (
        <Fragment>
            <h1>Your Accounts</h1>
            <Button primary={true} onClick={() => open()}>
                Add Account
            </Button>
            <Button primary={false} onClick={handleClearItems}>
                Clear items
            </Button>
            <Button primary={false} onClick={handleClearAllAccounts}>
                Clear all accounts
            </Button>
            <StyledItemList>
                {items?.map((item: any) => (
                    <PlaidItem item={item}></PlaidItem>
                ))}
            </StyledItemList>
        </Fragment>
    );
};