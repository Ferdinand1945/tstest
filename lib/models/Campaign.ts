import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { getSequelize } from "../db";

export class CampaignModel extends Model<
  InferAttributes<CampaignModel>,
  InferCreationAttributes<CampaignModel>
> {
  declare id: CreationOptional<number>;
  declare prefix: string;
  declare amount: string;
  declare currency: string;
  declare valid_from: string;
  declare valid_to: string;
  declare created_at: CreationOptional<Date>;
}

CampaignModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    prefix: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.CHAR(3),
      allowNull: false,
    },
    valid_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    valid_to: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: getSequelize(),
    tableName: "campaigns",
    modelName: "campaign",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);
