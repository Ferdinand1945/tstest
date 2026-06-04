import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { getSequelize } from "../db";
import { CampaignModel } from "./Campaign";

export class VoucherModel extends Model<
  InferAttributes<VoucherModel>,
  InferCreationAttributes<VoucherModel>
> {
  declare id: CreationOptional<number>;
  declare campaign_id: ForeignKey<CampaignModel["id"]>;
  declare code: string;
  declare created_at: CreationOptional<Date>;
}

VoucherModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    campaign_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "campaigns", key: "id" },
      onDelete: "CASCADE",
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: getSequelize(),
    tableName: "vouchers",
    modelName: "voucher",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ fields: ["campaign_id"] }],
  },
);
