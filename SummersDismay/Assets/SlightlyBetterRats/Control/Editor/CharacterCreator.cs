﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;

namespace SBR.Editor {
    public static class CharacterCreator {
        [MenuItem("GameObject/Character/Third Person")]
        public static void CreateThirdPerson() {
            GameObject charObj = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            charObj.name = "Third Person Character";
            charObj.transform.position = new Vector3(0, 1, 0);

            Object.DestroyImmediate(charObj.GetComponent<MeshRenderer>());
            Object.DestroyImmediate(charObj.GetComponent<MeshFilter>());

            Rigidbody rb = charObj.AddComponent<Rigidbody>();
            rb.useGravity = false;
            rb.constraints = RigidbodyConstraints.FreezeRotation;

            GameObject arrow = GameObject.CreatePrimitive(PrimitiveType.Cube);
            arrow.name = "Arrow";
            arrow.transform.parent = charObj.transform;
            arrow.transform.localPosition = new Vector3(0, 1, 1);
            arrow.transform.localScale = new Vector3(0.2f, 0.2f, 2.0f);

            Object.DestroyImmediate(arrow.GetComponent<Collider>());

            Brain brain = charObj.AddComponent<Brain>();
            brain.channelsType = "CharacterChannels";
            charObj.AddComponent<BasicCharacterController>();

            CharacterMotor motor = charObj.AddComponent<CharacterMotor>();
            motor.rotateMode = CharacterMotor.RotateMode.Movement;

            GameObject armObj = new GameObject("Camera Arm");
            armObj.transform.parent = charObj.transform;
            armObj.transform.localPosition = Vector3.zero;
            CameraArm arm = armObj.AddComponent<CameraArm>();

            GameObject camObj = new GameObject("Camera");
            camObj.tag = "MainCamera";
            camObj.transform.parent = armObj.transform;
            camObj.transform.localPosition = new Vector3(0, 0, -arm.targetLength);
            camObj.AddComponent<Camera>();
            camObj.AddComponent<FlareLayer>();
            camObj.AddComponent<AudioListener>();
            camObj.AddComponent<ViewTarget>();
    
            Selection.activeGameObject = charObj;
        }

        [MenuItem("GameObject/Character/First Person")]
        public static void CreateFirstPerson() {
            GameObject charObj = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            charObj.name = "First Person Character";
            charObj.transform.position = new Vector3(0, 1, 0);

            Object.DestroyImmediate(charObj.GetComponent<MeshRenderer>());
            Object.DestroyImmediate(charObj.GetComponent<MeshFilter>());

            Rigidbody rb = charObj.AddComponent<Rigidbody>();
            rb.useGravity = false;
            rb.constraints = RigidbodyConstraints.FreezeRotation;

            GameObject arrow = GameObject.CreatePrimitive(PrimitiveType.Cube);
            arrow.name = "Arrow";
            arrow.transform.parent = charObj.transform;
            arrow.transform.localPosition = new Vector3(0, 1, 1);
            arrow.transform.localScale = new Vector3(0.2f, 0.2f, 2.0f);

            Object.DestroyImmediate(arrow.GetComponent<Collider>());

            Brain brain = charObj.AddComponent<Brain>();
            brain.channelsType = "CharacterChannels";
            charObj.AddComponent<BasicCharacterController>();

            CharacterMotor motor = charObj.AddComponent<CharacterMotor>();
            motor.rotateMode = CharacterMotor.RotateMode.Control;

            GameObject headObj = new GameObject("Head");
            headObj.transform.parent = charObj.transform;
            headObj.transform.localPosition = new Vector3(0, 0.5f, 0);
            CameraArm arm = headObj.AddComponent<CameraArm>();
            arm.blocking = 0;
            arm.targetLength = 0;

            GameObject camObj = new GameObject("Camera");
            camObj.tag = "MainCamera";
            camObj.transform.parent = headObj.transform;
            camObj.transform.localPosition = Vector3.zero;
            camObj.AddComponent<Camera>();
            camObj.AddComponent<FlareLayer>();
            camObj.AddComponent<AudioListener>();
            camObj.AddComponent<ViewTarget>();

            Selection.activeGameObject = charObj;
        }

        [MenuItem("GameObject/Character/2D (Sprite)")]
        public static void Create2D() {
            GameObject charObj = new GameObject("2D Character");
            charObj.transform.position = new Vector3(0, 1, 0);

            BoxCollider2D col = charObj.AddComponent<BoxCollider2D>();
            col.size = new Vector2(1, 2);

            Rigidbody2D rb = charObj.AddComponent<Rigidbody2D>();
            rb.gravityScale = 0;
            rb.constraints |= RigidbodyConstraints2D.FreezeRotation;

            Brain brain = charObj.AddComponent<Brain>();
            brain.channelsType = "CharacterChannels";
            charObj.AddComponent<BasicCharacterController2D>().grabMouse = false;

            charObj.AddComponent<CharacterMotor2D>();
            
            GameObject camObj = new GameObject("Camera");
            camObj.tag = "MainCamera";
            camObj.transform.parent = charObj.transform;
            camObj.transform.localPosition = new Vector3(0, 0, -6);
            camObj.AddComponent<Camera>().orthographic = true;
            camObj.AddComponent<FlareLayer>();
            camObj.AddComponent<AudioListener>();
            camObj.AddComponent<ViewTarget>();

            Selection.activeGameObject = charObj;
        }
    }

}