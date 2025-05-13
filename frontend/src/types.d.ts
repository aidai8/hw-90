export type IncomingMessage =
    | {
    type: 'INIT_PIXELS';
    payload: Pixel[];
}
    | {
    type: 'NEW_PIXELS';
    payload: Pixel[];
}
    | {
    type: 'DRAW_PIXELS';
    payload: Pixel[];
};

export interface Pixel {
    x: number;
    y: number;
    color: string;
}