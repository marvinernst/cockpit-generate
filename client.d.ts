export type Tour = {
    title: string;
    text: string;
    color: string;
    _state: number;
    _modified: number;
    _mby: string;
    _created: number;
    _cby: string;
    _id: string;
};
export type Stationen = {
    title: string;
    subline: string;
    text: string;
    _modified: number;
    _mby: string;
    _created: number;
    _state: number;
    _cby: string;
    _id: string;
    tour: {
        _model: string;
        _id: string;
    };
    audio: {
        path: string;
        title: string;
        mime: string;
        type: string;
        description: string;
        tags: Array<undefined>;
        size: number;
        colors: undefined;
        width: undefined;
        height: undefined;
        _hash: string;
        _created: number;
        _modified: number;
        _cby: string;
        folder: string;
        _id: string;
    };
    audioDuration: string;
    image: {
        path: string;
        title: string;
        mime: string;
        type: string;
        description: string;
        tags: Array<undefined>;
        size: number;
        colors: Array<string>;
        width: number;
        height: number;
        _hash: string;
        _created: number;
        _modified: number;
        _cby: string;
        folder: string;
        _id: string;
    };
    licens: string;
    licence: string;
};
type TourFilter = {
    where: {
        title?: string;
        text?: string;
        color?: string;
        _state?: number;
        _modified?: number;
        _mby?: string;
        _created?: number;
        _cby?: string;
        _id?: string;
    };
};
type StationenFilter = {
    where: {
        title?: string;
        subline?: string;
        text?: string;
        _modified?: number;
        _mby?: string;
        _created?: number;
        _state?: number;
        _cby?: string;
        _id?: string;
        tour?: {
            _model?: string;
            _id?: string;
        };
        audio?: {
            path?: string;
            title?: string;
            mime?: string;
            type?: string;
            description?: string;
            tags?: Array<undefined>;
            size?: number;
            colors?: undefined;
            width?: undefined;
            height?: undefined;
            _hash?: string;
            _created?: number;
            _modified?: number;
            _cby?: string;
            folder?: string;
            _id?: string;
        };
        audioDuration?: string;
        image?: {
            path?: string;
            title?: string;
            mime?: string;
            type?: string;
            description?: string;
            tags?: Array<undefined>;
            size?: number;
            colors?: Array<string>;
            width?: number;
            height?: number;
            _hash?: string;
            _created?: number;
            _modified?: number;
            _cby?: string;
            folder?: string;
            _id?: string;
        };
        licens?: string;
        licence?: string;
    };
};
declare const client: {
    tour: {
        getAll: (filter?: TourFilter) => Promise<Tour[]>;
        get: (id: string) => Promise<Tour>;
    };
    stationen: {
        getAll: (filter?: StationenFilter) => Promise<Stationen[]>;
        get: (id: string) => Promise<Stationen>;
    };
};
export default client;
