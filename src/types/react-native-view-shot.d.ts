declare module 'react-native-view-shot' {
    import { Component } from 'react';
    import { ViewProps } from 'react-native';

    export interface CaptureOptions {
        format?: 'png' | 'jpg' | 'webm';
        quality?: number;
        result?: 'tmpfile' | 'base64' | 'data-uri' | 'zip-base64';
        snapshotContentContainer?: boolean;
    }

    export interface ViewShotProperties extends ViewProps {
        options?: CaptureOptions;
        captureMode?: 'mount' | 'continuous' | 'update';
    }

    export default class ViewShot extends Component<ViewShotProperties> {
        capture(): Promise<string>;
    }
}
