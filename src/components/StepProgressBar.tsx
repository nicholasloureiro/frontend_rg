import React from "react";
import "../styles/StepProgressBar.css";

type Step = {
    label: string;
};

type StepProgressBarProps = {
    steps: Step[];
    currentStep: number;
};

const StepProgressBar: React.FC<StepProgressBarProps> = ({ steps, currentStep }) => {
    return (
        <div
            className="step-progress-container"
            style={{ ["--steps" as any]: steps.length }}
        >
            <div className="step-progress-track">
                <div className="step-progress-background" style={{
                    left: `calc((100% / ${steps.length}) / 2)`,
                    width: `calc((100% - (100% / ${steps.length}))`,
                }} />
                <div
                    className="step-progress-filled"
                    style={{
                        left: `calc((100% / ${steps.length}) / 2)`,
                        width: `calc((100% / ${steps.length}) * ${currentStep})`,
                    }}
                />
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;

                    return (
                        <div key={index} className="step-progress-step">
                            <div
                                className={`step-circle ${isCompleted ? "completed" : isActive ? "active" : "future"
                                    }`}
                            >
                                {isCompleted ? (
                                    <span className="step-check">✓</span>
                                ) : isActive ? (
                                    <span className="step-dot" />
                                ) : null}
                            </div>
                            <div className="step-label">{step.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepProgressBar;
