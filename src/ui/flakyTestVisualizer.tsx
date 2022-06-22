import React, { useEffect, useRef } from "react";
import { FindMostTestsOnADay, ToDateStr } from "./utils/format";

enum FlakyTestStatus {
    UNKNOWN = 0,
    SUCCESS = 1,
    FAILURE = 2,
};

interface FlakyTest {
    testId: number;
    testName: string;
    date: number;
    status: FlakyTestStatus;
}
interface FlakyTestVisualizerProps {
    data: FlakyTest[][] | null;
    getData: () => void;
    loading: boolean;
}

const FlakyTestVisualizer = (props: FlakyTestVisualizerProps) => {
    const { data, getData, loading } = props;
    const canvasWidth = 800;
    const canvasHeight = 1000;
    const yAxisSpace = 10;
    const xAxisSpace = 10;
    const dataWidth = canvasWidth - yAxisSpace;
    const dataHeight = canvasHeight - xAxisSpace;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!data) {
            getData();
        } else {
            const context = canvasRef?.current?.getContext("2d");
            renderFlakyTestVisualizer(context || null);
        }
    }, [data, getData]);

    const renderFlakyTestVisualizer = (context: CanvasRenderingContext2D | null) => {
        if (!data || !context) {
            return;
        }
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        const image = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        const pixels = image.data;
        const longestDay = FindMostTestsOnADay(data);
        for (let i = 0; i < data.length; i ++) {
            const sameDayTests = data[i];
            for (let j = 0; j < sameDayTests.length; j++) {
                const test = sameDayTests[j];
                const { x, y, width, height } = calcDrawParams(i, j, longestDay);
                const color = getColor(test);
                drawTest(pixels, Math.ceil(x), Math.ceil(y), Math.ceil(width), Math.ceil(height), color);
            }
        }
        context.putImageData(image, 0, 0);

        context.fillStyle = "black";
        context.font = "16px sans-serif";
        let labelCt = 0;
        const { yScale, yDistancePerLabel, numYLabels } = createYAxisLabels(longestDay);
        while (labelCt <= numYLabels) {
            context.fillText((yScale * labelCt + 1).toString(), 0, (dataHeight - yDistancePerLabel * labelCt) - (yDistancePerLabel / 2));
            labelCt++;
        }
    }

    const calcDrawParams = (dayIdx: number, testIdx: number, longestDay: number) => {
        const numDays = data?.length || 1;
        const width = dataWidth / numDays;
        const height = dataHeight / longestDay;
        const x = yAxisSpace + (dayIdx * canvasWidth) / numDays;
        const y = dataHeight - ((testIdx + 1) * height);
        return { x, y, width, height };
    }

    const getColor = (test: FlakyTest) => {
        switch(test.status) {
            case FlakyTestStatus.FAILURE:
                return [255, 0, 0];
            case FlakyTestStatus.SUCCESS:
                return [0, 100, 0];
            default:
                return [0, 0, 0];
        }
    }

    const drawTest = (pixels: Uint8ClampedArray, x: number, y: number, width: number, height: number, color: number[]) => {
        for (let j = y; j < y + height; j++) {
            for (let i = x; i < x + width; i++) {
                if (i < 0 || i >= canvasWidth) {
                    continue;
                }
                const idx = i * 4 + j * 4 * canvasWidth;
                if (j === y || i === x) {
                    pixels[idx] = 0;
                    pixels[idx + 1] = 0;
                    pixels[idx + 2] = 0;
                    pixels[idx + 3] = 255;
                } else {
                    pixels[idx] = color[0] * 255;
                    pixels[idx + 1] = color[1] * 255;
                    pixels[idx + 2] = color[2] * 255;
                    pixels[idx + 3] = 255;
                }
            }
        }
    }

    const createYAxisLabels = (longestDay: number) => {
        let yScale = 1;
        if (longestDay < 10) {
            const yDistancePerLabel = dataHeight / longestDay;
            const numYLabels = longestDay;
            return { yScale, yDistancePerLabel, numYLabels };
        }
        while (longestDay / yScale > 10) {
            yScale++;
        }
        const numYLabels = Math.floor(longestDay / yScale);
        const yDistancePerLabel = dataHeight / yScale;
        return { yScale, yDistancePerLabel, numYLabels };
    }

    if (loading) {
        return <div>Loading!</div>;
    }
    return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />;
}

export default FlakyTestVisualizer;