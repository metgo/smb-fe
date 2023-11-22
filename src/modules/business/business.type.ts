export interface Image {
    image: string,
    caption: string,
    alt: string,
}

// eslint-disable-next-line no-shadow
export enum BusinessStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    CLOSED = 'CLOSED',
    REJECTED = 'REJECTED',
}
