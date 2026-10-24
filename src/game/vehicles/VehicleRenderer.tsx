import React from 'react';
import { VehicleDefinition, VehicleColors, VehicleTelemetry } from '../../types/vehicle';
import { FighterJetModel } from './FighterJetModel';
import { HelicopterModel } from './HelicopterModel';
import { CarModel } from './CarModel';

interface VehicleRendererProps {
  vehicle: VehicleDefinition;
  colors: VehicleColors;
  telemetry: VehicleTelemetry;
  wheelSteerAngle?: number;
  wheelRotationAngle?: number;
  isCockpitView?: boolean;
}

export const VehicleRenderer: React.FC<VehicleRendererProps> = ({
  vehicle,
  colors,
  telemetry,
  wheelSteerAngle = 0,
  wheelRotationAngle = 0,
  isCockpitView = false
}) => {
  if (vehicle.category === 'jet') {
    return (
      <FighterJetModel
        colors={colors}
        afterburnerActive={telemetry.afterburnerActive}
        landingGearDown={telemetry.landingGearDown}
        throttle={telemetry.throttlePercent / 100}
        variant={vehicle.modelVariant}
        isCockpitView={isCockpitView}
      />
    );
  }

  if (vehicle.category === 'helicopter') {
    return (
      <HelicopterModel
        colors={colors}
        rotorRpmPercent={telemetry.rpmPercent}
        variant={vehicle.modelVariant}
      />
    );
  }

  if (vehicle.category === 'car') {
    return (
      <CarModel
        colors={colors}
        wheelSteerAngle={wheelSteerAngle}
        wheelRotationAngle={wheelRotationAngle}
        isBraking={telemetry.verticalSpeedMs < -0.1 || telemetry.speedKmh > 5 && telemetry.throttlePercent < 5}
        variant={vehicle.modelVariant}
        isCockpitView={isCockpitView}
      />
    );
  }

  return null;
};
