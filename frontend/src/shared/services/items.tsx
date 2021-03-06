/* eslint-disable react/prop-types */
import React, { createContext, useCallback, useContext, useReducer, useRef, useMemo, ReactElement, FC } from 'react';
import { getItemsByUser as apiGetItemsByUser } from './api';
import { keyBy, groupBy, Dictionary } from 'lodash';
import { Item } from '../../types/item';
import { Context } from 'vm';

/**
 * @desc Enumerated action types
 */
enum TYPES {
    SUCCESSFUL_GET,
    SUCCESSFUL_REQUEST,
    DELETE_BY_USER,
    SUCCESSFUL_DELETE,
}

type State = Dictionary<Item>;

interface ContextProps {
    itemsById: Dictionary<Item>;
    itemsByUser: Dictionary<Item[]>;
    getItemsByUser: (userId: string) => Promise<void>;
}

/**
 * @desc Handles updates to the Items state as dictated by dispatched actions.
 */
const reducer = (state: State, [type, payload]: [TYPES, Item[]]): State => {
    const newDict = keyBy(payload, 'plaidItemId');
    switch (type) {
        case TYPES.SUCCESSFUL_REQUEST:
            if (!payload.length) {
                return state;
            }

            return {
                ...state,
                ...newDict,
            };
        default:
            console.warn('unknown action: ', { type, payload });
            return state;
    }
};

export const ItemsContext = createContext<Partial<ContextProps>>({});

export const ItemsProvider: FC = ({ children }) => {
    const [itemsById, dispatch] = useReducer(reducer, {});

    const hasRequested = useRef<{
        byId: { [key: string]: boolean };
        byUser: { [key: string]: boolean };
    }>({
        byId: {},
        byUser: {},
    });

    const getItemsByUser = useCallback(async (userId) => {
        hasRequested.current.byUser[userId] = true;
        const result = await apiGetItemsByUser(userId);
        const payload = await result.json();
        dispatch([TYPES.SUCCESSFUL_REQUEST, payload as Item[]]);
    }, []);

    const value = useMemo(() => {
        const allItems = Object.values(itemsById);
        return {
            allItems,
            itemsById,
            itemsByUser: groupBy(allItems, 'userId'),
            getItemsByUser,
        };
    }, [itemsById, getItemsByUser]);

    return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
};

export default function useItems(): Context {
    const context = useContext(ItemsContext);
    return context;
}
